#!/usr/bin/env bash

for git_cache in $(git ls-files -i --exclude-standard)
do echo "$git_cache" && git rm -f --cached "$git_cache"
done

git add -A
git commit -a -m "pre patch commit"
npm version patch
VERSION=`npm view fa-nodejs version`
git commit -a -m "patch to $VERSION"
git push
git push --tags
npm publish

#git tag "$VERSION" -a -m "$VERSION"
#git tag "$VERSION"
#git push origin "$VERSION"
#git push --tags
#git tag -d "v$VERSION"
#git push --delete origin "v$VERSION"
#bower version patch -m "patched to %s"
#bower register fa-javascript git://github.com/foxart/fa-javascript.git
