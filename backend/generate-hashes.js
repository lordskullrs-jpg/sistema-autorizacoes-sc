const bcrypt = require('bcryptjs');

async function generateHashes() {
  const senha = 'senha123';
  const rounds = 10;
  
  console.log('Gerando hashes bcrypt para senha: senha123\n');
  console.log('='.repeat(80));
  
  const usuarios = [
    { id: 'admin-001', email: 'admin@inter.com', nome: 'Administrador', perfil: 'admin' },
    { id: 'sup14-001', email: 'sup14@inter.com', nome: 'Supervisor Sub-14', perfil: 'supervisor', categoria: 'Sub14' },
    { id: 'sup15-001', email: 'sup15@inter.com', nome: 'Supervisor Sub-15', perfil: 'supervisor', categoria: 'Sub15' },
    { id: 'sup16-001', email: 'sup16@inter.com', nome: 'Supervisor Sub-16', perfil: 'supervisor', categoria: 'Sub16' },
    { id: 'sup17-001', email: 'sup17@inter.com', nome: 'Supervisor Sub-17', perfil: 'supervisor', categoria: 'Sub17' },
    { id: 'sup20-001', email: 'sup20@inter.com', nome: 'Supervisor Sub-20', perfil: 'supervisor', categoria: 'Sub20' },
    { id: 'ss-001', email: 'servicosocial@inter.com', nome: 'Serviço Social', perfil: 'servicosocial' },
    { id: 'monitor-001', email: 'monitor@inter.com', nome: 'Monitor', perfil: 'monitor' }
  ];
  
  console.log('\n-- SQL para atualizar senhas dos usuários\n');
  
  for (const user of usuarios) {
    const hash = await bcrypt.hash(senha, rounds);
    console.log(`UPDATE usuarios SET senha_hash = '${hash}' WHERE id = '${user.id}'; -- ${user.nome}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\nHash de exemplo completo (60 caracteres):');
  const exampleHash = await bcrypt.hash(senha, rounds);
  console.log(exampleHash);
  console.log(`Tamanho: ${exampleHash.length} caracteres`);
}

generateHashes().catch(console.error);
