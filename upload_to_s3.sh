#!/bin/bash
#
# upload_to_s3.sh: A program to upload lfwebjs v3 content to S3.

#
# $rc usage()
#

function usage {
    # Print the usage information, for this program.

    echo "Usage:
    upload_to_s3.sh.sh -h
    upload_to_s3.sh.sh -e <environment>

    -h: display this help
    -e: environment ('qa', 'staging', or 'production')"

    return 0

}

#
# $rc set_options( <arg> [ <arg> ... ] )
#

function set_options {
    # Set global vars from commandline options and validation options given

    while getopts ":he:" opt
    do
        case $opt in
        h)
            usage
            exit 0
            ;;
        e)
            export LF_ENVIRONMENT="$OPTARG"
            ;;
        \?)
            echo "$0: error - unrecognized option $1"
            usage
            return 1
            ;;
        :)
            echo "$0: error - option -$OPTARG requires an argument."
            usage
            return 1
            ;;
        esac
    done

   if [ $# -eq 0 ]
       then
       echo "One or more arguments must be specified."
       usage
       return 1
   fi
   if [ -z $LF_ENVIRONMENT ]

       then
       echo "Option -e is required."
       usage
       return 1
   fi

   return 0

}

set_options $*

# Without the options set, it won't be possible to upload content.
# Error messages are printed by set_options function
[ "$?" -ne 0 ] && exit 1

# This path is relative to the build root
JS_VERSION_PATH='lfconv/VERSION'
JS_ASSET_PATH='lfconv/build/bundle/'

BUCKET_URL="s3://livefyre-zor"
REMOTE_PATH="$BUCKET_URL/$LF_ENVIRONMENT/v3.0.$(<$JS_VERSION_PATH)/"

#
# Assets are present
#

# Asset path must exist to upload resources
if [ ! -d $JS_ASSET_PATH ]
then
    echo "Could not find assets to upload in '$JS_ASSET_PATH'"
    exit 1
fi


#
# Check that the correct config is loaded
#

if [[ $(s3cmd info $BUCKET_URL 2>&1 > /dev/null) =~ ^ERROR ]]
then
    echo "Error running s3cmd, do you have the correct config installed?"
    exit 1
fi

TEMPDIR=$(mktemp -dt jsdeploy.XXXXX)
cp -R "$JS_ASSET_PATH"/* $TEMPDIR
find $TEMPDIR -type f -print0 | xargs -0 gzip
find $TEMPDIR -type f -name '*.gz' | while read f; do mv "$f" "${f%.gz}"; done

s3cmd sync -M --acl-public --add-header 'Cache-Control:max-age=2592000' --add-header 'Content-Encoding:gzip' "$TEMPDIR/" "$REMOTE_PATH"
rm -rf $TEMPDIR
