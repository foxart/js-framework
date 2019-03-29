#!/usr/bin/env bash

#npm install --save-dev @babel/core
#npm install --save-dev @babel/preset-env

for git_cache in $(git ls-files -i --exclude-standard)
do echo "$git_cache" && git rm -f --cached "$git_cache"
done

PREV=`git describe --abbrev=0 --tags`
TAG=(${PREV//./ })
TAG1=${TAG[0]}
TAG2=${TAG[1]}
TAG3=${TAG[2]}
TAG3=$((TAG3+1))
NEXT="$TAG1.$TAG2.$TAG3"
COMMIT=`git rev-parse HEAD`
#MESSAGE=`git log -1`
MESSAGE=`git log -1 --oneline`
PUBLISHED=`git describe --contains ${COMMIT}`

if [[ -z "$PUBLISHED" ]]; then
    echo "updating tag <$PREV> to version <$NEXT>"
#    npm version patch
    git commit -a -m "<$PREV> to <$NEXT>\n$MESSAGE"
#    npm version ${NEXT}
#    git push
#    git tag ${TAG}
#    git push --tags
#    npm publish
else
    echo "already have tag <$PREV> on commit <$COMMIT>"
fi


#git add -A
#git commit -a -m "pre patch commit"
#npm version patch
#VERSION=`npm view fa-nodejs version`
#git commit -a -m "patch to $VERSION"
#git push
#git push --tags
#npm publish

#git tag "$VERSION" -a -m "$VERSION"
#git tag "$VERSION"
#git push origin "$VERSION"
#git push --tags
#git tag -d "v$VERSION"
#git push --delete origin "v$VERSION"
#bower version patch -m "patched to %s"
#bower register fa-javascript git://github.com/foxart/fa-javascript.git
