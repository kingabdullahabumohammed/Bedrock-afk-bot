const bedrock = require('bedrock-protocol');
const express = require('express');
const app = express();

// 1. خادم ويب لإبقاء الخدمة حية (لـ Render أو UptimeRobot)
app.get('/', (req, res) => {
  res.send('<h1>Bot is Alive, Moving & Respawning 24/7! 🚀</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📡 Web server is listening on port ${PORT}`);
});

// 2. إعدادات السيرفر (تأكد من صحة البيانات)
const botOptions = {
  host: 'thisisservero.falixsrv.me', // عنوان سيرفر الفاليكس الخاص بك
  port: 25199,                       
  username: 'bbtr45yb',             
  offline: true                      
};

let client;

// 3. دالة إنشاء وتشغيل البوت
function createBot() {
  console.log('🔄 جاري محاولة الاتصال بالسيرفر...');
  client = bedrock.createClient(botOptions);

  // عند الدخول بنجاح
  client.on('spawn', () => {
    console.log('👤 البوت رسبن وبدأ العمل!');

    // نظام الحركة والنشاط كل 3 دقائق
    const activityInterval = setInterval(() => {
      try {
        if (!client.startGameData) return;

        const moveX = (Math.random() - 0.5) * 2;
        const moveZ = (Math.random() - 0.5) * 2;
        
        // إرسال حزمة الحركة للبقاء نشطاً (Anti-AFK)
        client.queue('player_auth_input', {
          pitch: 0,
          yaw: 0,
          position: { 
            x: client.startGameData.player_position.x + moveX, 
            y: client.startGameData.player_position.y, 
            z: client.startGameData.player_position.z + moveZ 
          },
          move_vector: { x: moveX, z: moveZ },
          head_yaw: 0,
          input_data: { _value: 0n },
          input_mode: 'mouse',
          play_mode: 'normal',
          tick: 0n,
          delta: { x: moveX, y: 0, z: moveZ }
        });

        // إرسال رسالة شات اختيارية
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'I am active and alive! 🏃‍♂️'
        });
        
        console.log(`🏃‍♂️ تحرك البوت لتجنب الطرد: X:${moveX.toFixed(2)}`);
      } catch (err) {
        console.log('⚠️ تنبيه في نظام الحركة:', err.message);
      }
    }, 180000);

    // تنظيف المؤقت عند الفصل لمنع تداخل المهام
    client.on('close', () => clearInterval(activityInterval));
  });

  // --- الميزات الجديدة ---

  // 4. إعادة الرسبنة التلقائية عند الموت
  client.on('death', () => {
    console.log('💀 البوت مات! جاري إعادة الرسبنة تلقائياً...');
    try {
      client.queue('respawn', {
        position: { x: 0, y: 0, z: 0 },
        state: 0 
      });
      console.log('✅ تم إرسال طلب العودة للحياة.');
    } catch (err) {
      console.log('❌ فشل طلب الرسبنة:', err.message);
    }
  });

  // 5. إعادة الاتصال التلقائي عند الانفصال
  client.on('disconnect', (packet) => {
    console.log('🔌 انفصل البوت، السبب:', packet.reason || 'غير معروف');
    setTimeout(createBot, 10000); // محاولة إعادة الاتصال بعد 10 ثوانٍ
  });

  client.on('error', (err) => {
    console.log('❌ خطأ تقني:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      setTimeout(createBot, 30000); // إذا كان السيرفر مطفأ، يحاول كل 30 ثانية
    }
  });
}

// البدء لأول مرة
createBot();
