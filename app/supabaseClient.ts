import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eogtjzeodbriahwmaqfw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_A_DKwqE7Ygs2VAiKSSuVxQ_YyjhXfgb';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️ Supabase URL이 .env.local 파일에 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ⚡ 보드게임 이미지 파일 업로드 헬퍼 함수
 * @param file 업로드할 File 객체
 * @param bucketName Supabase Storage 버킷명 (기본값: 'game-images')
 * @returns 업로드 완료된 이미지의 Public URL (실패 시 null)
 */
export const uploadGameImage = async (file: File, bucketName: string = 'game-images'): Promise<string | null> => {
  try {
    // 1. 파일명 중복 방지용 고유 파일명 생성
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `games/${fileName}`;

    // 2. Supabase Storage에 파일 업로드
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('⚠️ Supabase Storage 업로드 오류:', uploadError.message);
      alert('이미지 업로드에 실패했습니다: ' + uploadError.message);
      return null;
    }

    // 3. 업로드된 파일의 Public URL 추출
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error('⚠️ 이미지 업로드 중 예외 발생:', err);
    alert('이미지 업로드 중 오류가 발생했습니다: ' + (err.message || err));
    return null;
  }
};