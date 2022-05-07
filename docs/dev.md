## Dai

Dai：
https://etherscan.io/address/0x6B175474E89094C44Da98b954EedeAC495271d0F#code

CDai:
https://etherscan.io/address/0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643#code

Unitroller：
https://etherscan.io/address/0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B#code

Comptroller:
https://etherscan.io/address/0x7b5e3521a049c8ff88e6349f33044c6cc33c113c#code




## recentBorrowBalance

recentBorrowBalance = borrower.borrowBalance * market.borrowIndex / borrower.borrowIndex


## operation

### Dai

Approve:https://etherscan.io/tx/0xe07951944db49c4336f41d584042eb200f02db5393a0aecdb9eaad73b55d4560
Mint:https://etherscan.io/tx/0x575c179ed0da599607d1bfd93fb68793e427330cc06d54334be4857ef3e37945
EnterMarket(as collaternl)：https://etherscan.io/tx/0x9e313cb7120463bf00fc5ec11c81e262efac16f940d7670c90ecf95802cacfa4
Borrow:https://etherscan.io/tx/0x41b9c3d9c0c8c9f986cdb991119e7d6a32d26c82a82ec5580c47f4057e453eda
repay:https://etherscan.io/tx/0xc6d107976f6d13821cc718a5ec364e702968a2388a943a89c6b301922e7ff05b

### ETH
Mint: https://etherscan.io/tx/0xd6bc39136f258a57f7afbb7ec985b919dbde0278f4012b499fc2f5e89b31287e
EnterMarket(as collaternl):https://etherscan.io/tx/0xd2e2266823ac87c1d144d95c0c13ea33c53e6c54e0065a9ef6bcf8a43885a265
borrow:https://etherscan.io/tx/0x16b97931fd573692984481a6a03e41ed098d0cb2f7d710937607f5c9b844000a
repay:https://etherscan.io/tx/0xdd6c9311bcd5795dda7e157d4c535e17899cb9ba20f10fcec3e2bb8fc1338350

### USDC
mint: https://etherscan.io/tx/0x30e63587e2cdb5a19c7257d564bfe38c8a1d57532a4d709815a64572517d3aa3
withdraw: https://etherscan.io/tx/0xbc6637e5967d91900b063ac0e4adb54852a9033d5acbc222a78a10ff98a46609
borrow: https://etherscan.io/tx/0x0278a50955e8a7b8017c40049d95ae2c116cd2b18c041e498937c100ace32420
exit: https://etherscan.io/tx/0x0278a50955e8a7b8017c40049d95ae2c116cd2b18c041e498937c100ace32420
borrow https://etherscan.io/tx/0x712b9cad682f641a85889d19b4a0833816655e3723932751c8d1d5fe6591f4e9
repayBorrow https://etherscan.io/tx/0x20553535e4df8c3f255fbb2dca78240a6b43bd241a4e99309522b88a00e5fa12
### comp
https://etherscan.io/tx/0x296b541db9914d8d681f89afad0c5ed9485749211078dd8ec09f201405886b12
repayBorrow: https://etherscan.io/tx/0x81e11496773599ec17d7826ea098a1108879ab98883908c22f9c40735d9bb1d5
### collect comp
https://etherscan.io/tx/0x7f1575d346a81512ccd04beaef06d3b073ae04f21f69946e5b9aa7f30b674bc3


### install solc

```
sudo wget https://github.com/ethereum/solidity/releases/download/v0.5.16/solc-static-linux -O /bin/solc
sudo chmod +x /bin/solc
```

### install shasum
```
sudo apt install -y ucommon-utils
```