rm build -rf &&
rm ../Timenode-v2/build -rf &&
truffle migrate --reset &&
cp build ../Timenode-v2 -r
