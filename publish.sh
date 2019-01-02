#!/usr/bin/env bash

VERSION=`npm view fa-nodejs version`
git commit -a -m "$VERSION"
npm version patch
npm publish
