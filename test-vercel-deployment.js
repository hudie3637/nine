#!/usr/bin/env node

/**
 * Vercel 部署前检查脚本
 * 用于验证项目是否准备好部署到 Vercel
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkDeploymentReadiness() {
  console.log('🔍 开始 Vercel 部署前检查...\n');
  
  let allChecksPassed = true;
  
  // 检查必需文件
  const requiredFiles = [
    'vercel.json',
    'package.json',
    'vite.config.ts',
    'index.html',
    'api/analyze.ts',
    'api/generate-image.ts'
  ];
  
  console.log('📁 文件完整性检查:');
  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(__dirname, file));
      console.log(`  ✅ ${file}`);
    } catch (error) {
      console.log(`  ❌ ${file} (缺失)`);
      allChecksPassed = false;
    }
  }
  
  // 检查 package.json 配置
  console.log('\n📦 package.json 配置检查:');
  try {
    const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, 'package.json'), 'utf8'));
    
    // 检查必需的脚本
    const requiredScripts = ['build', 'vercel-build'];
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`  ✅ scripts.${script}: ${packageJson.scripts[script]}`);
      } else {
        console.log(`  ❌ 缺少 scripts.${script}`);
        allChecksPassed = false;
      }
    }
    
    // 检查必需的依赖
    const requiredDeps = ['@vercel/node', '@supabase/supabase-js', 'react', 'vite'];
    for (const dep of requiredDeps) {
      if ((packageJson.dependencies && packageJson.dependencies[dep]) || 
          (packageJson.devDependencies && packageJson.devDependencies[dep])) {
        console.log(`  ✅ ${dep} 已安装`);
      } else {
        console.log(`  ❌ 缺少依赖: ${dep}`);
        allChecksPassed = false;
      }
    }
  } catch (error) {
    console.log('  ❌ 无法读取 package.json');
    allChecksPassed = false;
  }
  
  // 检查环境变量配置
  console.log('\n🔐 环境变量检查:');
  const envExample = path.join(__dirname, '.env.example');
  try {
    const envContent = await fs.readFile(envExample, 'utf8');
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY', 
      'VITE_DOUBAO_API_KEY',
      'VITE_ARK_API_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (envContent.includes(envVar)) {
        console.log(`  ✅ ${envVar} (在 .env.example 中定义)`);
      } else {
        console.log(`  ⚠️  ${envVar} (未在 .env.example 中定义)`);
      }
    }
    
    console.log('  💡 部署时需要在 Vercel 项目设置中配置这些环境变量');
  } catch (error) {
    console.log('  ⚠️  未找到 .env.example 文件');
  }
  
  // 检查 API 路由
  console.log('\n🔌 API 路由检查:');
  const apiRoutes = ['api/analyze.ts', 'api/generate-image.ts'];
  for (const route of apiRoutes) {
    try {
      const content = await fs.readFile(path.join(__dirname, route), 'utf8');
      if (content.includes('VercelRequest') && content.includes('VercelResponse')) {
        console.log(`  ✅ ${route} (使用 Vercel 函数格式)`);
      } else {
        console.log(`  ⚠️  ${route} (可能需要转换为 Vercel 函数格式)`);
      }
    } catch (error) {
      console.log(`  ❌ ${route} (文件不存在)`);
      allChecksPassed = false;
    }
  }
  
  // 检查构建配置
  console.log('\n🏗️  构建配置检查:');
  try {
    const viteConfig = await fs.readFile(path.join(__dirname, 'vite.config.ts'), 'utf8');
    if (viteConfig.includes('build') || viteConfig.includes('outDir')) {
      console.log('  ✅ Vite 构建配置存在');
    } else {
      console.log('  ⚠️  建议检查 Vite 构建配置');
    }
  } catch (error) {
    console.log('  ❌ 无法读取 vite.config.ts');
    allChecksPassed = false;
  }
  
  // 输出总结
  console.log('\n' + '='.repeat(50));
  if (allChecksPassed) {
    console.log('🎉 部署准备检查通过！');
    console.log('\n下一步操作:');
    console.log('1. 确保所有环境变量已在 Vercel 项目中配置');
    console.log('2. 选择部署方式:');
    console.log('   - GitHub 集成部署（推荐）');
    console.log('   - Vercel CLI 部署');
    console.log('3. 部署后验证功能是否正常');
  } else {
    console.log('❌ 部署准备检查未通过');
    console.log('请解决上述标记的问题后再尝试部署');
  }
  console.log('='.repeat(50));
  
  return allChecksPassed;
}

// 运行检查
checkDeploymentReadiness().catch(console.error);