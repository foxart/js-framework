#!/usr/bin/env bash

for git_cache in $(git ls-files -i --exclude-standard)
do echo "$git_cache" && git rm -f --cached "$git_cache"
done

#VERSION=$(npm version patch)
VERSION=`git describe --abbrev=0 --tags`
VERSION_BITS=(${VERSION//./ })
TAG1=${VERSION_BITS[0]}
TAG2=${VERSION_BITS[1]}
TAG3=${VERSION_BITS[2]}
TAG3=$((TAG3+1))
TAG="$TAG1.$TAG2.$TAG3"
COMMIT=`git rev-parse HEAD`
MESSAGE=`git log -1`
PUBLISHED=`git describe --contains ${COMMIT}`

if [[ -z "$PUBLISHED" ]]; then
    echo "updating tag <$VERSION> to version <$TAG>"
    git commit -a -m "${TAG}"
    git push
    git tag ${TAG}
    git push --tags
    npm publish
else
    echo "already have tag <$VERSION> on commit <$COMMIT>"
fi
