#!/usr/bin/env bash

#git commit -a -m "pre patch"
VERSION=`npm version patch`
git commit -a -m "$VERSION"
npm version patch
npm publish
