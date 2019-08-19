#!/usr/bin/env bash
## CLEAN GIT CACHE
for git_cache in $(git ls-files -i --exclude-standard)
do echo "$git_cache" && git rm -f --cached "$git_cache"
done
## PUBLISH TO GIT
PREV=`git describe --abbrev=0 --tags`
TAG=(${PREV//./ })
TAG1=${TAG[0]}
TAG2=${TAG[1]}
TAG3=${TAG[2]}
TAG3=$((TAG3+1))
NEXT="$TAG1.$TAG2.$TAG3"
BRANCH=`git branch | grep \* | cut -d ' ' -f2`
COMMIT=`git rev-parse HEAD`
MESSAGE=`git log -1 --oneline` #MESSAGE=`git log -1`
PUBLISHED=`git describe --contains ${COMMIT}`
if [[ "$BRANCH" != "master" ]]; then
    echo "branch <$BRANCH> cannot be published"
elif [[ -z "$PUBLISHED" ]]; then
    echo "updating to tag <$NEXT>"
    git add -A
    git commit -a -m "update to tag <$NEXT> $COMMIT: $MESSAGE"
    git push
    npm version ${NEXT} #npm version patch
    npm publish
#    git tag ${NEXT}
    git push --tags
else
    echo "already have tag <$PREV> on commit $COMMIT: $MESSAGE"
fi
