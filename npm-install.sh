#!/bin/bash
export npm_config_disturl=https://gh-contractor-zcbenz.s3.amazonaws.com/atom-shell/dist
export npm_config_target=0.11.13
export npm_config_arch=x64
HOME=~/.atom-shell-gyp npm install
