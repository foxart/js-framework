#!/usr/bin/env bash


VERSION = `npm version patch`
git commit -a -m "$VERSION"
#npm publish
