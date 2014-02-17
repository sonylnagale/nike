var Collection = Livefyre.require('streamhub-sdk/collection');

AVATAR_WALL_INIT = false;
function initAvatarWall() {
    if (AVATAR_WALL_INIT) {
        return;
    }

    var view = window.avatarWallView = new AvatarWallView({
        el: document.getElementById('avatar-wall')
    });

    var collection = new Collection({
        "network": "labs-t402.fyre.co",
        "siteId": "303827",
        "articleId": "xbox-0",
        "environment": "t402.livefyre.com",
        "replies": true
    });

    collection.pipe(view);

    AVATAR_WALL_INIT = true;
}

function destroyAvatarWall() {
    window.avatarWallView.restartLoop();
    AVATAR_WALL_INIT = false;
};
