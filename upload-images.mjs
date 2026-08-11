import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🚀 스크립트 실행 시작...');

// Supabase 접속 정보 (직접 입력하거나 process.env 사용)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eogtjzeodbriahwmaqfw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_A_DKwqE7Ygs2VAiKSSuVxQ_YyjhXfgb'; // Anon Key 또는 Service Role Key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const IMAGES_DIR = path.resolve('./game_images');
const BUCKET_NAME = 'game-images';

async function bulkUploadAndSync() {
  try {
    console.log(`🔍 폴더 경로 확인: ${IMAGES_DIR}`);

    // 폴더 존재 여부 체크
    if (!fs.existsSync(IMAGES_DIR)) {
      console.error(`❌ 오류: '${IMAGES_DIR}' 폴더가 존재하지 않습니다!`);
      return;
    }

    const files = fs.readdirSync(IMAGES_DIR).filter(file => !file.startsWith('.'));
    console.log(`📂 총 ${files.length}개의 이미지 파일을 찾았습니다.`);

    if (files.length === 0) {
      console.warn('⚠️ game_images 폴더 안에 파일이 없습니다. 이미지 파일을 넣어주세요!');
      return;
    }

    for (const fileName of files) {
      const ext = path.extname(fileName);
      const gameId = path.basename(fileName, ext);
      const filePath = path.join(IMAGES_DIR, fileName);

      console.log(`\n----------------------------------------`);
      console.log(`[${gameId}] 처리 시작 (${fileName})...`);

      const fileBuffer = fs.readFileSync(filePath);
      const storagePath = `games/${fileName}`;

      // 1. Supabase Storage에 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType: getContentType(ext),
          upsert: true,
        });

      if (uploadError) {
        console.error(`❌ [${gameId}] Storage 업로드 실패:`, uploadError.message);
        continue;
      }

      // 2. Public URL 가져오기
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. DB 업데이트
      const { error: dbError } = await supabase
        .from('games')
        .update({ image_url: publicUrl })
        .eq('game_id', gameId);

      if (dbError) {
        console.error(`❌ [${gameId}] DB 업데이트 실패:`, dbError.message);
      } else {
        console.log(`✅ [${gameId}] 매칭 성공! -> ${publicUrl}`);
      }
    }

    console.log('\n🎉 모든 작업이 완료되었습니다!');
  } catch (err) {
    console.error('💥 실행 중 예외 발생:', err);
  }
}

function getContentType(ext) {
  switch (ext.toLowerCase()) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}

// ⚡ 필수: 함수 실행
bulkUploadAndSync();