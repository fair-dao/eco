const fs = require('fs');
const path = require('path');
const solc = require('solc');

// 合约文件路径
const contractPath = './src/contracts/FairStakeToken.sol';

// 读取合约源文件
const contractSource = fs.readFileSync(contractPath, 'utf8');

// 解析导入文件的回调函数
function findImport(importPath) {
  // 处理 OpenZeppelin 合约的导入
  if (importPath.startsWith('@openzeppelin/')) {
    // OpenZeppelin 合约通常位于 node_modules/@openzeppelin/contracts/ 目录下
    const resolvedPath = path.resolve(__dirname, 'node_modules', importPath);
    
    if (fs.existsSync(resolvedPath)) {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return { contents: content };
    } else {
      return { error: `File not found: ${resolvedPath}` };
    }
  }
  
  // 处理本地文件导入
  if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.endsWith('.sol')) {
    const resolvedPath = path.resolve(path.dirname(contractPath), importPath);
    
    if (fs.existsSync(resolvedPath)) {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return { contents: content };
    } else {
      return { error: `File not found: ${resolvedPath}` };
    }
  }
  
  return { error: `Unsupported import path: ${importPath}` };
}

// 编译配置
const input = {
  language: 'Solidity',
  sources: {
    [path.basename(contractPath)]: {
      content: contractSource
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': [
          'abi',
          'evm.bytecode.object',
          'evm.bytecode.sourceMap',
          'evm.deployedBytecode.object',
          'evm.deployedBytecode.sourceMap',
          'metadata'
        ]
      }
    }
  }
};

console.log('开始编译合约...');

try {
  // 编译合约
  const compilationResult = JSON.parse(solc.compile(JSON.stringify(input), {
    import: findImport
  }));
  
  if (compilationResult.errors) {
    console.log('编译过程中遇到的所有信息（包括警告）：');
    compilationResult.errors.forEach(err => {
      console.log(`\n${err.severity}: ${err.message}`);
      if (err.formattedMessage) {
        console.log(err.formattedMessage);
      }
    });
  }
  
  // 检查是否有错误
  const hasError = compilationResult.errors && compilationResult.errors.some(err => err.severity === 'error');
  
  if (hasError) {
    console.log('\n编译失败，请修复错误后重新编译。');
  } else {
    console.log('\n合约编译成功！');
    
    // 检查是否编译成功
    const contract = compilationResult.contracts[path.basename(contractPath)]['FairStakeToken'];
    if (contract) {
      // 输出合约信息
      console.log('\n合约ABI长度:', contract.abi.length);
      console.log('合约字节码长度:', contract.evm.bytecode.object.length);
      
      // 保存编译结果到 compiled-solcjs 目录
      const outputDir = './compiled-solcjs';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // 保存合约字节码和ABI
      fs.writeFileSync(path.join(outputDir, 'FairStakeToken_sol_FairStakeToken.bin'), contract.evm.bytecode.object);
      fs.writeFileSync(path.join(outputDir, 'FairStakeToken_sol_FairStakeToken.abi'), JSON.stringify(contract.abi, null, 2));
      
      // 保存完整的编译结果
      fs.writeFileSync(path.join(outputDir, 'FairStakeToken.json'), JSON.stringify(compilationResult, null, 2));
      
      console.log('\n编译结果已保存到 compiled-solcjs 目录');
    } else {
      console.log('\n未找到FairStakeToken合约的编译结果');
    }
  }
} catch (error) {
  console.error('\n编译过程中发生错误:', error);
}
