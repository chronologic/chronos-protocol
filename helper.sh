rm build -rf &&
rm ../timenode/build -rf &&
truffle migrate --reset &&
cp build ../timenode -r
