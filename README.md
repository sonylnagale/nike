#Nike KD Aunt Pearl VI's launch

## Environment
This live in the Livefyre production S3 bucket under `"livefyre-nike-kd-ap-6"` and is fronted by a cloudfront distribution. The URL to view the page is `http://d2a73tupsbislb.cloudfront.net`.

## Deployment
Run the `upload_to_s3.sh` script found in the project root directory

    e.g. ./upload_to_s3.sh -b livefyre-nike-kd-ap-6 -s ../kd-aunt-pearl-6/ -i invalidation.txt -e gzip

Note, we gzip the contents.. so if you don't want that, don't put "-e gzip".

This script takes the files in the source directory, copy them to a temp directory, and upload them to the bucket. While it uploads it to a bucket, it sets it's ACL to public (which isn't yet configurable) and sets the appropriate headers - most importantly, the cache-control header for all the files.

