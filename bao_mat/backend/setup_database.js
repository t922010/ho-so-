const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bao_mat',
  password: process.env.DB_PASS || 'password',
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Đọc file SQL
    const sqlFile = path.join(__dirname, 'setup_database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Chia SQL thành các câu lệnh riêng biệt
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('⚠️  Already exists:', statement.substring(0, 50) + '...');
          } else {
            console.error('❌ Error executing:', statement.substring(0, 50) + '...');
            console.error('Error:', error.message);
          }
        }
      }
    }
    
    // Test connection và kiểm tra bảng
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_sessions', 'audit_logs')
      ORDER BY table_name
    `);
    
    console.log('\n📊 Database tables created:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    // Kiểm tra user mẫu
    const userResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total users in database: ${userResult.rows[0].count}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('🔐 Default admin credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin123!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Chạy setup nếu file được gọi trực tiếp
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
