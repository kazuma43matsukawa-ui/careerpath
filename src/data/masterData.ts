import { Qualification, Career, Badge } from '../types';

export const QUALIFICATIONS: Qualification[] = [
  // 語学
  { id: 'toeic990', name: 'TOEIC 990点', category: 'language', totalHours: 400, color: '#1d4ed8', difficulty: 5 },
  { id: 'toeic800', name: 'TOEIC 800点', category: 'language', totalHours: 200, color: '#3b82f6', difficulty: 3 },
  { id: 'toeic600', name: 'TOEIC 600点', category: 'language', totalHours: 100, color: '#60a5fa', difficulty: 2 },
  { id: 'eiken1', name: '英検1級', category: 'language', totalHours: 500, color: '#1e40af', difficulty: 5 },
  { id: 'eiken2', name: '英検2級', category: 'language', totalHours: 150, color: '#2563eb', difficulty: 3 },
  { id: 'eiken_pre2', name: '英検準2級', category: 'language', totalHours: 80, color: '#93c5fd', difficulty: 2 },
  { id: 'toefl100', name: 'TOEFL 100点', category: 'language', totalHours: 300, color: '#1e3a8a', difficulty: 4 },
  { id: 'ielts7', name: 'IELTS 7.0', category: 'language', totalHours: 350, color: '#1d4ed8', difficulty: 4 },
  { id: 'kanken2', name: '漢字検定2級', category: 'language', totalHours: 100, color: '#7c3aed', difficulty: 3 },
  { id: 'nihongo1', name: '日本語検定1級', category: 'language', totalHours: 200, color: '#dc2626', difficulty: 4 },
  { id: 'chinese_hsk5', name: 'HSK5級（中国語）', category: 'language', totalHours: 300, color: '#b45309', difficulty: 4 },
  { id: 'korean_topik', name: 'TOPIK II（韓国語）', category: 'language', totalHours: 200, color: '#0369a1', difficulty: 3 },

  // IT・テクノロジー
  { id: 'it_passport', name: 'ITパスポート', category: 'it', totalHours: 150, color: '#8b5cf6', difficulty: 2 },
  { id: 'basic_it', name: '基本情報技術者', category: 'it', totalHours: 300, color: '#7c3aed', difficulty: 3 },
  { id: 'applied_it', name: '応用情報技術者', category: 'it', totalHours: 500, color: '#6d28d9', difficulty: 4 },
  { id: 'db_specialist', name: 'データベーススペシャリスト', category: 'it', totalHours: 600, color: '#5b21b6', difficulty: 5 },
  { id: 'network_specialist', name: 'ネットワークスペシャリスト', category: 'it', totalHours: 600, color: '#4c1d95', difficulty: 5 },
  { id: 'aws_saa', name: 'AWS SAA', category: 'it', totalHours: 150, color: '#f59e0b', difficulty: 3 },
  { id: 'aws_sap', name: 'AWS SAP', category: 'it', totalHours: 300, color: '#d97706', difficulty: 4 },
  { id: 'google_ace', name: 'Google Cloud ACE', category: 'it', totalHours: 150, color: '#2563eb', difficulty: 3 },
  { id: 'oracle_java', name: 'Oracle Java SE', category: 'it', totalHours: 200, color: '#dc2626', difficulty: 3 },
  { id: 'python3', name: 'Python3エンジニア認定', category: 'it', totalHours: 100, color: '#059669', difficulty: 2 },
  { id: 'security_plus', name: '情報セキュリティマネジメント', category: 'it', totalHours: 200, color: '#0891b2', difficulty: 3 },
  { id: 'pmp', name: 'PMP（プロジェクト管理）', category: 'it', totalHours: 300, color: '#0369a1', difficulty: 4 },

  // 金融・会計
  { id: 'boki3', name: '簿記3級', category: 'finance', totalHours: 100, color: '#10b981', difficulty: 2 },
  { id: 'boki2', name: '簿記2級', category: 'finance', totalHours: 250, color: '#059669', difficulty: 3 },
  { id: 'boki1', name: '簿記1級', category: 'finance', totalHours: 800, color: '#047857', difficulty: 5 },
  { id: 'fp3', name: 'FP3級', category: 'finance', totalHours: 80, color: '#3db891', difficulty: 2 },
  { id: 'fp2', name: 'FP2級', category: 'finance', totalHours: 150, color: '#0f6e4a', difficulty: 3 },
  { id: 'fp1', name: 'FP1級', category: 'finance', totalHours: 400, color: '#064e3b', difficulty: 5 },
  { id: 'cpa', name: '公認会計士', category: 'finance', totalHours: 3000, color: '#065f46', difficulty: 5 },
  { id: 'tax_accountant', name: '税理士', category: 'finance', totalHours: 3000, color: '#047857', difficulty: 5 },
  { id: 'cfa', name: 'CFA（証券アナリスト）', category: 'finance', totalHours: 900, color: '#0369a1', difficulty: 5 },
  { id: 'securities', name: '証券外務員一種', category: 'finance', totalHours: 100, color: '#0891b2', difficulty: 2 },
  { id: 'actuary', name: 'アクチュアリー', category: 'finance', totalHours: 2000, color: '#1e40af', difficulty: 5 },

  // 医療・福祉
  { id: 'nurse', name: '看護師', category: 'medical', totalHours: 2000, color: '#ec4899', difficulty: 5 },
  { id: 'care_worker', name: '介護福祉士', category: 'medical', totalHours: 500, color: '#f472b6', difficulty: 3 },
  { id: 'care_manager', name: 'ケアマネジャー', category: 'medical', totalHours: 300, color: '#db2777', difficulty: 4 },
  { id: 'social_worker', name: '社会福祉士', category: 'medical', totalHours: 400, color: '#be185d', difficulty: 4 },
  { id: 'pharmacist', name: '登録販売者', category: 'medical', totalHours: 300, color: '#9d174d', difficulty: 3 },
  { id: 'med_coder', name: '医療事務（診療報酬）', category: 'medical', totalHours: 150, color: '#831843', difficulty: 2 },
  { id: 'radiology', name: '診療放射線技師', category: 'medical', totalHours: 1500, color: '#701a75', difficulty: 5 },
  { id: 'pt', name: '理学療法士', category: 'medical', totalHours: 2000, color: '#a21caf', difficulty: 5 },

  // 法律・行政
  { id: 'judicial_scrivener', name: '司法書士', category: 'legal', totalHours: 3000, color: '#0f172a', difficulty: 5 },
  { id: 'administrative_scrivener', name: '行政書士', category: 'legal', totalHours: 600, color: '#1e293b', difficulty: 4 },
  { id: 'judicial_assistant', name: '法務検定2級', category: 'legal', totalHours: 200, color: '#334155', difficulty: 3 },
  { id: 'paralegal', name: 'ビジネス実務法務3級', category: 'legal', totalHours: 100, color: '#475569', difficulty: 2 },
  { id: 'paralegal2', name: 'ビジネス実務法務2級', category: 'legal', totalHours: 200, color: '#64748b', difficulty: 3 },
  { id: 'patent', name: '弁理士', category: 'legal', totalHours: 3000, color: '#0c4a6e', difficulty: 5 },

  // 不動産
  { id: 'takken', name: '宅地建物取引士', category: 'real_estate', totalHours: 300, color: '#f59e0b', difficulty: 3 },
  { id: 'kanri', name: 'マンション管理士', category: 'real_estate', totalHours: 400, color: '#d97706', difficulty: 4 },
  { id: 'kanri_gyomu', name: '管理業務主任者', category: 'real_estate', totalHours: 300, color: '#b45309', difficulty: 3 },
  { id: 'fudosan_kanteishi', name: '不動産鑑定士', category: 'real_estate', totalHours: 2000, color: '#92400e', difficulty: 5 },

  // 人事・労務
  { id: 'sharou', name: '社会保険労務士', category: 'hr', totalHours: 800, color: '#0891b2', difficulty: 4 },
  { id: 'career_consultant', name: 'キャリアコンサルタント', category: 'hr', totalHours: 150, color: '#0369a1', difficulty: 3 },
  { id: 'hrm', name: 'HRM検定', category: 'hr', totalHours: 100, color: '#1d4ed8', difficulty: 2 },
  { id: 'mental_health', name: 'メンタルヘルスマネジメント', category: 'hr', totalHours: 100, color: '#6d28d9', difficulty: 2 },

  // 公務員
  { id: 'civil_national', name: '国家公務員（一般職）', category: 'civil', totalHours: 1000, color: '#1e3a8a', difficulty: 4 },
  { id: 'civil_local', name: '地方公務員（上級）', category: 'civil', totalHours: 800, color: '#1e40af', difficulty: 4 },
  { id: 'police', name: '警察官採用試験', category: 'civil', totalHours: 500, color: '#1d4ed8', difficulty: 3 },
  { id: 'teacher', name: '教員採用試験', category: 'civil', totalHours: 600, color: '#2563eb', difficulty: 3 },

  // クリエイティブ
  { id: 'color_coord', name: 'カラーコーディネーター', category: 'creative', totalHours: 100, color: '#ec4899', difficulty: 2 },
  { id: 'web_design', name: 'Webデザイン技能検定', category: 'creative', totalHours: 150, color: '#f472b6', difficulty: 2 },
  { id: 'graphic', name: 'グラフィックデザイン検定', category: 'creative', totalHours: 150, color: '#db2777', difficulty: 3 },
  { id: 'photography', name: '写真検定', category: 'creative', totalHours: 80, color: '#be185d', difficulty: 2 },
  { id: 'dtp', name: 'DTPエキスパート', category: 'creative', totalHours: 200, color: '#9d174d', difficulty: 3 },

  // 飲食・調理
  { id: 'cook', name: '調理師免許', category: 'food', totalHours: 500, color: '#dc2626', difficulty: 3 },
  { id: 'sommelier', name: 'ソムリエ', category: 'food', totalHours: 300, color: '#991b1b', difficulty: 4 },
  { id: 'sake', name: '日本酒検定', category: 'food', totalHours: 100, color: '#7f1d1d', difficulty: 2 },
  { id: 'confectionery', name: '菓子製造技能士', category: 'food', totalHours: 300, color: '#c2410c', difficulty: 3 },
  { id: 'nutrition', name: '栄養士', category: 'food', totalHours: 1000, color: '#ea580c', difficulty: 4 },
  { id: 'barista', name: 'コーヒーマイスター', category: 'food', totalHours: 100, color: '#92400e', difficulty: 2 },

  // 美容・ファッション
  { id: 'beauty', name: '美容師', category: 'beauty', totalHours: 2000, color: '#d946ef', difficulty: 4 },
  { id: 'nail', name: 'ネイリスト技能検定1級', category: 'beauty', totalHours: 300, color: '#c026d3', difficulty: 3 },
  { id: 'makeup', name: 'メイクアップ技術検定', category: 'beauty', totalHours: 150, color: '#a21caf', difficulty: 2 },
  { id: 'fashion', name: 'ファッションビジネス能力検定', category: 'beauty', totalHours: 100, color: '#86198f', difficulty: 2 },
  { id: 'aroma', name: 'アロマテラピー検定1級', category: 'beauty', totalHours: 80, color: '#701a75', difficulty: 2 },

  // ビジネス全般
  { id: 'biz_manner', name: 'ビジネスマナー検定', category: 'business', totalHours: 50, color: '#64748b', difficulty: 1 },
  { id: 'biz_kanji', name: 'ビジネス文書検定', category: 'business', totalHours: 50, color: '#475569', difficulty: 1 },
  { id: 'biz_math', name: 'ビジネス数学検定', category: 'business', totalHours: 80, color: '#334155', difficulty: 2 },
  { id: 'marketing', name: 'マーケティング検定', category: 'business', totalHours: 150, color: '#f59e0b', difficulty: 3 },
  { id: 'pr', name: 'PR検定', category: 'business', totalHours: 100, color: '#d97706', difficulty: 2 },
  { id: 'mb_admin', name: 'MBA（経営学修士）', category: 'business', totalHours: 2000, color: '#b45309', difficulty: 5 },
  { id: 'qc', name: 'QC検定2級', category: 'business', totalHours: 150, color: '#92400e', difficulty: 3 },
  { id: 'eco', name: '環境社会検定（eco検定）', category: 'business', totalHours: 80, color: '#166534', difficulty: 2 },

  // 起業・スタートアップ
  { id: 'chusho', name: '中小企業診断士', category: 'startup', totalHours: 1000, color: '#0ea5e9', difficulty: 4 },
  { id: 'ip', name: '知的財産管理技能士', category: 'startup', totalHours: 150, color: '#0284c7', difficulty: 3 },
  { id: 'digital_marketing', name: 'デジタルマーケティング検定', category: 'startup', totalHours: 100, color: '#0369a1', difficulty: 2 },
  { id: 'sns_manager', name: 'SNSマネージャー認定', category: 'startup', totalHours: 50, color: '#075985', difficulty: 1 },
];

export const CAREERS: Career[] = [
  // ビジネス・金融
  { id: 'global_trading', title: 'グローバル商社パーソン', description: '英語力と財務知識で国際ビジネスの最前線へ', qualificationIds: ['toeic800', 'boki2'], emoji: '🌏', category: 'ビジネス' },
  { id: 'financial_planner', title: '信頼される金融プランナー', description: 'お金の専門家として顧客の人生設計をサポート', qualificationIds: ['fp3', 'fp2'], emoji: '💰', category: '金融' },
  { id: 'accountant', title: '公認会計士・税理士', description: '財務のプロとして企業・個人を支える', qualificationIds: ['boki2', 'cpa'], emoji: '📊', category: '会計' },
  { id: 'securities_analyst', title: '証券アナリスト', description: '金融市場を分析し投資判断をサポートする専門家', qualificationIds: ['securities', 'cfa'], emoji: '📈', category: '金融' },
  { id: 'banker', title: '銀行・金融機関キャリア', description: '金融の知識でお客様の資産形成をサポート', qualificationIds: ['fp3', 'securities', 'boki3'], emoji: '🏦', category: '金融' },

  // IT・テクノロジー
  { id: 'it_consultant', title: 'DXを推進するITコンサルタント', description: 'IT知識でビジネス変革を主導するプロフェッショナル', qualificationIds: ['it_passport', 'basic_it'], emoji: '💻', category: 'IT' },
  { id: 'cloud_engineer', title: 'クラウドエンジニア', description: 'AWSやGCPでインフラを設計・構築するエキスパート', qualificationIds: ['aws_saa', 'google_ace'], emoji: '☁️', category: 'IT' },
  { id: 'security_engineer', title: 'セキュリティエンジニア', description: 'サイバーセキュリティで企業を守る専門家', qualificationIds: ['security_plus', 'basic_it'], emoji: '🔒', category: 'IT' },
  { id: 'data_scientist', title: 'データサイエンティスト', description: 'データ分析でビジネス課題を解決する', qualificationIds: ['python3', 'db_specialist'], emoji: '📉', category: 'IT' },
  { id: 'pm', title: 'プロジェクトマネージャー', description: 'チームをリードしてプロジェクトを成功に導く', qualificationIds: ['pmp', 'applied_it'], emoji: '🗂️', category: 'IT' },

  // 法律・行政
  { id: 'legal_professional', title: '法律の専門家', description: '法律知識で企業や個人をサポートする', qualificationIds: ['paralegal', 'paralegal2', 'administrative_scrivener'], emoji: '⚖️', category: '法律' },
  { id: 'civil_servant', title: '公務員', description: '国や地域のために働くキャリア', qualificationIds: ['civil_national', 'civil_local'], emoji: '🏛️', category: '公務員' },
  { id: 'patent_attorney', title: '弁理士・知財専門家', description: '発明・ブランドを守る知的財産のプロ', qualificationIds: ['patent', 'ip'], emoji: '💡', category: '法律' },

  // 不動産
  { id: 'real_estate', title: '不動産のプロフェッショナル', description: '宅建を活かして不動産業界でキャリアを築く', qualificationIds: ['takken', 'kanri'], emoji: '🏠', category: '不動産' },
  { id: 'real_estate_appraiser', title: '不動産鑑定士', description: '不動産の価値を正確に評価する専門家', qualificationIds: ['takken', 'fudosan_kanteishi'], emoji: '🏢', category: '不動産' },

  // 人事・HR
  { id: 'hr_specialist', title: '労務・HR専門家', description: '社労士資格で企業の人事・労務を支える', qualificationIds: ['sharou', 'mental_health'], emoji: '👥', category: 'HR' },
  { id: 'career_advisor', title: 'キャリアアドバイザー', description: '人の転職・就職をサポートするプロ', qualificationIds: ['career_consultant', 'hrm'], emoji: '🧭', category: 'HR' },

  // 医療・福祉
  { id: 'nurse_career', title: '看護師・医療従事者', description: '人の命と健康を守る医療のプロフェッショナル', qualificationIds: ['nurse'], emoji: '🏥', category: '医療' },
  { id: 'care_career', title: '介護・福祉の専門家', description: '高齢化社会を支える重要なキャリア', qualificationIds: ['care_worker', 'care_manager'], emoji: '💚', category: '福祉' },
  { id: 'pharmacy', title: '薬局・ドラッグストア勤務', description: '医薬品の専門家として地域医療を支える', qualificationIds: ['pharmacist'], emoji: '💊', category: '医療' },

  // 飲食・調理
  { id: 'chef', title: 'シェフ・料理人', description: '食の世界でプロとして活躍する', qualificationIds: ['cook', 'nutrition'], emoji: '👨‍🍳', category: '飲食' },
  { id: 'sommelier_career', title: 'ソムリエ・飲料の専門家', description: 'ワインや日本酒の知識で食文化を豊かに', qualificationIds: ['sommelier', 'sake'], emoji: '🍷', category: '飲食' },
  { id: 'cafe', title: 'カフェ・バリスタ', description: 'コーヒーの魅力を届けるプロフェッショナル', qualificationIds: ['barista', 'cook'], emoji: '☕', category: '飲食' },

  // 美容
  { id: 'beauty_career', title: '美容師・ヘアスタイリスト', description: 'お客様の美しさを引き出すクリエイター', qualificationIds: ['beauty', 'makeup'], emoji: '✂️', category: '美容' },
  { id: 'nail_career', title: 'ネイリスト', description: 'ネイルアートで人を美しく輝かせる', qualificationIds: ['nail', 'color_coord'], emoji: '💅', category: '美容' },

  // クリエイティブ
  { id: 'web_designer', title: 'Webデザイナー', description: 'デジタル空間で美しい体験を設計する', qualificationIds: ['web_design', 'color_coord'], emoji: '🎨', category: 'クリエイティブ' },
  { id: 'dtp_designer', title: 'DTPデザイナー', description: '印刷物・グラフィックのプロフェッショナル', qualificationIds: ['dtp', 'graphic'], emoji: '🖨️', category: 'クリエイティブ' },

  // 起業・マーケティング
  { id: 'entrepreneur', title: '起業家・スタートアップ', description: '自分のビジネスで社会を変える', qualificationIds: ['chusho', 'digital_marketing'], emoji: '🚀', category: '起業' },
  { id: 'marketer', title: 'マーケター・SNS担当', description: 'データとクリエイティブで売上を伸ばす', qualificationIds: ['marketing', 'sns_manager'], emoji: '📣', category: 'マーケティング' },

  // 教育
  { id: 'teacher_career', title: '教師・教育者', description: '次世代を育てる教育のプロフェッショナル', qualificationIds: ['teacher'], emoji: '📚', category: '教育' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  language: '語学',
  it: 'IT・テクノロジー',
  finance: '金融・会計',
  medical: '医療・福祉',
  legal: '法律・行政',
  real_estate: '不動産',
  hr: '人事・労務',
  civil: '公務員',
  creative: 'クリエイティブ',
  food: '飲食・調理',
  beauty: '美容',
  business: 'ビジネス',
  startup: '起業・マーケ',
};

export const CATEGORY_COLORS: Record<string, string> = {
  language: '#3b82f6',
  it: '#8b5cf6',
  finance: '#10b981',
  medical: '#ec4899',
  legal: '#64748b',
  real_estate: '#f59e0b',
  hr: '#0891b2',
  civil: '#1e3a8a',
  creative: '#d946ef',
  food: '#dc2626',
  beauty: '#a21caf',
  business: '#92400e',
  startup: '#0ea5e9',
};

export const BADGES: Badge[] = [
  { id: 'first_study', name: 'スタートダッシュ', emoji: '🚀', description: '初めて学習を記録した' },
  { id: 'streak_3', name: '3日連続', emoji: '🔥', description: '3日連続で学習した' },
  { id: 'streak_7', name: '1週間継続', emoji: '⚡', description: '7日連続で学習した' },
  { id: 'streak_30', name: '1ヶ月達人', emoji: '💎', description: '30日連続で学習した' },
  { id: 'total_10h', name: '10時間突破', emoji: '⏱️', description: '累計10時間学習した' },
  { id: 'total_50h', name: '50時間の壁', emoji: '🏆', description: '累計50時間学習した' },
  { id: 'total_100h', name: '100時間マスター', emoji: '👑', description: '累計100時間学習した' },
  { id: 'pomodoro_10', name: 'ポモドーロ職人', emoji: '🍅', description: 'ポモドーロを10回完了した' },
  { id: 'week_commit', name: '週間達成', emoji: '🎯', description: '週間目標を達成した' },
  { id: 'multi_goal', name: 'マルチチャレンジャー', emoji: '🌟', description: '3つ以上の資格に挑戦中' },
];
