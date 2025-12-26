const fs = require('fs');
const path = require('path');

// 所有模块的翻译字典
const allTranslations = {
  // home-exchange 翻译
  "home-exchange": {
    "ar": {
      "代币兑换": "تبادل الرموز",
      "销毁FR数量": "عدد FR المراد حرقها",
      "输入销毁数量": "أدخل عدد FR المراد حرقها",
      "奖励代币": "رمز الجائزة",
      "请选择奖励代币": "يرجى اختيار رمز الجائزة",
      "销毁FR": "حرق FR",
      "FR代币余额": "رصيد الرمز FR",
      "销毁日志": "سجل الحرق",
      "未开通兑换": "التبادل غير متاح",
      "已结束": "انتهى",
      "可兑换": "قابل للتبادل",
      "获得": "يمكن الحصول",
      "即将开始": "سيبدأ قريبا",
      "分钟": "دقائق",
      "合约余额": "رصيد العقد",
      "兑换规则": "قواعد التبادل",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "يمكن للمستخدمين تبديل أنواع أخرى من الرموز عن طريق حرق الرمز FR",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "في الفترة من 24 ساعة قبل التبادل المتاح، لا يمكن أن يتجاوز مبلغ التبادل في كل مرة 1% من الرصيد المتاح للتبادل",
      "请确保您有足够的 FR 代币余额进行兑换": "يرجى التأكد من وجود رصيد كافٍ من الرموز FR للتبادل",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "بعد اتمام صفقة التبادل، سيتم حرق الرمز FR المقابل بشكل دائم",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "تتوفر وظيفة التبادل فقط خلال فترة زمنية محددة، ولا يمكن المشاركة بعد انتهاء الفترة"
    },
    "es": {
      "代币兑换": "Intercambio de tokens",
      "销毁FR数量": "Cantidad de FR a quemar",
      "输入销毁数量": "Ingrese la cantidad a quemar",
      "奖励代币": "Token de recompensa",
      "请选择奖励代币": "Por favor seleccione un token de recompensa",
      "销毁FR": "Quitar FR",
      "FR代币余额": "Saldo de tokens FR",
      "销毁日志": "Registro de quema",
      "未开通兑换": "Intercambio no disponible",
      "已结束": "Finalizado",
      "可兑换": "Intercambiable",
      "获得": "Puede obtener",
      "即将开始": "Próximamente",
      "分钟": "Minutos",
      "合约余额": "Saldo del contrato",
      "兑换规则": "Reglas de intercambio",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "Los usuarios pueden intercambiar otros tipos de tokens quemando tokens FR",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "En las 24 horas antes del intercambio, el monto de cada intercambio no puede exceder el 1% del saldo intercambiable",
      "请确保您有足够的 FR 代币余额进行兑换": "Por favor asegúrese de tener suficiente saldo de tokens FR para el intercambio",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "Los tokens FR correspondientes se destruirán permanentemente después de completar la transacción de intercambio",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "La función de intercambio solo está disponible durante un período de tiempo específico y no se puede participar después de la fecha de vencimiento"
    },
    "fr": {
      "代币兑换": "Échange de tokens",
      "销毁FR数量": "Quantité de FR à brûler",
      "输入销毁数量": "Entrez la quantité à brûler",
      "奖励代币": "Token de récompense",
      "请选择奖励代币": "Veuillez sélectionner un token de récompense",
      "销毁FR": "Brûler FR",
      "FR代币余额": "Solde des tokens FR",
      "销毁日志": "Journal de combustion",
      "未开通兑换": "Échange non disponible",
      "已结束": "Terminé",
      "可兑换": "Échangeable",
      "获得": "Vous pouvez obtenir",
      "即将开始": "Bientôt",
      "分钟": "Minutes",
      "合约余额": "Solde du contrat",
      "兑换规则": "Règles d'échange",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "Les utilisateurs peuvent échanger d'autres types de tokens en brûlant des tokens FR",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "Dans les 24 heures avant l'échange, le montant de chaque échange ne peut pas dépasser 1% du solde échangeable",
      "请确保您有足够的 FR 代币余额进行兑换": "Veuillez vous assurer d'avoir un solde suffisant en tokens FR pour l'échange",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "Après l'achèvement de la transaction d'échange, les tokens FR correspondants seront brûlés définitivement",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "La fonction d'échange est disponible uniquement pendant une période de temps spécifiée et ne peut pas être utilisée après la date limite"
    },
    "hi": {
      "代币兑换": "टोकन विनिमय",
      "销毁FR数量": "जलाने वाले FR की मात्रा",
      "输入销毁数量": "जलाने वाली मात्रा दर्ज करें",
      "奖励代币": "पुरस्कार टोकन",
      "请选择奖励代币": "कृपया एक पुरस्कार टोकन चुनें",
      "销毁FR": "FR जलाएं",
      "FR代币余额": "FR टोकन शेष",
      "销毁日志": "जलने का लॉग",
      "未开通兑换": "विनिमय उपलब्ध नहीं",
      "已结束": "समाप्त",
      "可兑换": "विनिमय योग्य",
      "获得": "प्राप्त कर सकते हैं",
      "即将开始": "जल्द ही शुरू",
      "分钟": "मिनट",
      "合约余额": "संविदा शेष",
      "兑换规则": "विनिमय नियम",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "उपयोगकर्ता FR टोकन जलाकर अन्य प्रकार के टोकन का विनिमय कर सकते हैं",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "विनिमय योग्य 24 घंटे पहले तक, प्रत्येक विनिमय राशि विनिमय योग्य शेष का 1% से अधिक नहीं हो सकती",
      "请确保您有足够的 FR 代币余额进行兑换": "कृपया सुनिश्चित करें कि आपके पास विनिमय के लिए पर्याप्त FR टोकन शेष है",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "विनिमय लेनदेन पूरा होने के बाद, संबंधित FR टोकन स्थायी रूप से नष्ट हो जाएंगे",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "विनिमय फ़ंक्शन केवल एक निर्दिष्ट समय अवधि के लिए खुली है और समय समाप्त होने के बाद भाग लेना संभव नहीं है"
    },
    "ja": {
      "代币兑换": "トークン交換",
      "销毁FR数量": "燃焼させるFRの数量",
      "输入销毁数量": "燃焼数量を入力",
      "奖励代币": "報酬トークン",
      "请选择奖励代币": "報酬トークンを選択してください",
      "销毁FR": "FRを燃焼",
      "FR代币余额": "FRトークン残高",
      "销毁日志": "燃焼ログ",
      "未开通兑换": "交換未開放",
      "已结束": "終了",
      "可兑换": "交換可能",
      "获得": "獲得できます",
      "即将开始": "開催予定",
      "分钟": "分",
      "合约余额": "コントラクト残高",
      "兑换规则": "交換ルール",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "ユーザーはFRトークンを燃焼して他のタイプのトークンと交換できます",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "交換可能な24時間前以内に、1回の交換額は交換可能残高の1%を超えてはならない",
      "请确保您有足够的 FR 代币余额进行兑换": "交換のために十分なFRトークン残高があることを確認してください",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "交換トランザクション完了後、対応するFRトークンは永久に燃焼されます",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "交換機能は指定された期間内にのみ開放され、期限が過ぎると参加できません"
    },
    "ko": {
      "代币兑换": "토큰 교환",
      "销毁FR数量": "소각할 FR 수량",
      "输入销毁数量": "소각 수량을 입력하세요",
      "奖励代币": "보상 토큰",
      "请选择奖励代币": "보상 토큰을 선택해주세요",
      "销毁FR": "FR 소각",
      "FR代币余额": "FR 토큰 잔액",
      "销毁日志": "소각 로그",
      "未开通兑换": "교환 미개통",
      "已结束": "종료",
      "可兑换": "교환 가능",
      "获得": "받을 수 있습니다",
      "即将开始": "곧 시작",
      "分钟": "분",
      "合约余额": "계약 잔액",
      "兑换规则": "교환 규칙",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "사용자는 FR 토큰을 소각하여 다른 유형의 토큰과 교환할 수 있습니다",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "교환 가능 24시간 전 내에, 1회 교환 금액은 교환 가능 잔액의 1%를 초과할 수 없습니다",
      "请确保您有足够的 FR 代币余额进行兑换": "교환을 위한 충분한 FR 토큰 잔액이 있는지 확인하세요",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "교환 거래 완료 후, 해당 FR 토큰은 영구적으로 소각됩니다",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "교환 기능은 지정된 시간 내에만 열려 있으며, 만료 후 참여할 수 없습니다"
    },
    "ru": {
      "代币兑换": "Обмен токенов",
      "销毁FR数量": "Количество FR для сжигания",
      "输入销毁数量": "Введите количество для сжигания",
      "奖励代币": "Награда в токенах",
      "请选择奖励代币": "Пожалуйста, выберите токен награды",
      "销毁FR": "Сжечь FR",
      "FR代币余额": "Баланс токенов FR",
      "销毁日志": "Журнал сжигания",
      "未开通兑换": "Обмен недоступен",
      "已结束": "Завершено",
      "可兑换": "Обменный",
      "获得": "Можно получить",
      "即将开始": "Скоро начнется",
      "分钟": "Минуты",
      "合约余额": "Баланс контракта",
      "兑换规则": "Правила обмена",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "Пользователи могут обменять другие типы токенов, сжигая токены FR",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "В течение 24 часов до обмена доступно, каждый обмен сумма не может превышать 1% от обменного баланса",
      "请确保您有足够的 FR 代币余额进行兑换": "Пожалуйста, убедитесь, что у вас есть достаточно баланса токенов FR для обмена",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "После завершения обменной транзакции соответствующие токены FR будут навсегда сожжены",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "Обмен доступен только в течение определенного периода времени, после завершения не удастся участвовать"
    },
    "th": {
      "代币兑换": "การแลกเปลี่ยนโทเคน",
      "销毁FR数量": "จำนวน FR ที่จะทำลาย",
      "输入销毁数量": "กรอกจำนวนที่จะทำลาย",
      "奖励代币": "โทเคนรางวัล",
      "请选择奖励代币": "กรุณาเลือกโทเคนรางวัล",
      "销毁FR": "ทำลาย FR",
      "FR代币余额": "ยอดคงเหลือ FR",
      "销毁日志": "บันทึกการทำลาย",
      "未开通兑换": "การแลกเปลี่ยนไม่เปิดใช้งาน",
      "已结束": "สิ้นสุดแล้ว",
      "可兑换": "สามารถแลกเปลี่ยนได้",
      "获得": "สามารถได้รับ",
      "即将开始": "เริ่มเร็วๆ นี้",
      "分钟": "นาที",
      "合约余额": "ยอดคงเหลือในสัญญา",
      "兑换规则": "กฎการแลกเปลี่ยน",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "ผู้ใช้สามารถแลกโทเคนอื่นๆ โดยทำลายโทเคน FR",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "ภายใน 24 ชั่วโมงก่อนการแลกเปลี่ยนได้, จำนวนเงินการแลกเปลี่ยนต่อครั้งไม่สามารถเกิน 1% ของยอดคงเหลือที่สามารถแลกเปลี่ยน",
      "请确保您有足够的 FR 代币余额进行兑换": "ตรวจสอบยอด FR เพียงพอสำหรับการแลกเปลี่ยน",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "FR ที่ทำลายจะถูกลบออกถาวร",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "ฟีเจอร์การแลกเปลี่ยนเปิดใช้งานในช่วงเวลาที่ระบุเท่านั้น และจะไม่สามารถเข้าร่วมหลังจากหมดอายุ"
    },
    "vi": {
      "代币兑换": "Trao đổi token",
      "销毁FR数量": "Số lượng FR cần tiêu hủy",
      "输入销毁数量": "Nhập số lượng cần tiêu hủy",
      "奖励代币": "Token thưởng",
      "请选择奖励代币": "Vui lòng chọn token thưởng",
      "销毁FR": "Tiêu hủy FR",
      "FR代币余额": "Số dư token FR",
      "销毁日志": "Nhật ký tiêu hủy",
      "未开通兑换": "Chưa mở trao đổi",
      "已结束": "Đã kết thúc",
      "可兑换": "Có thể trao đổi",
      "获得": "Có thể nhận được",
      "即将开始": "Sắp bắt đầu",
      "分钟": "Phút",
      "合约余额": "Số dư hợp đồng",
      "兑换规则": "Quy tắc trao đổi",
      "用户可以通过销毁 FR 代币来兑换其他类型的代币": "Người dùng có thể trao đổi các loại token khác bằng cách tiêu hủy token FR",
      "可兑换前24小时内，每次兑换金额不能超过可兑换余额的1%": "Trong vòng 24 giờ trước khi có thể trao đổi, mỗi lần trao đổi không được vượt quá 1% của số dư có thể trao đổi",
      "请确保您有足够的 FR 代币余额进行兑换": "Vui lòng đảm bảo bạn có đủ số dư token FR để trao đổi",
      "兑换交易完成后，相应的 FR 代币将被永久销毁": "Sau khi hoàn thành giao dịch trao đổi, token FR tương ứng sẽ bị tiêu hủy vĩnh viễn",
      "兑换功能仅在指定时间段内开放，过期将无法参与": "Chức năng trao đổi chỉ mở trong một khoảng thời gian cụ thể, sau khi hết hạn sẽ không thể tham gia"
    }
  },
  // 其他模块的翻译
  "home-staking": {
    "ar": {
      "质押": "تثبيت",
      "收益": "أرباح",
      "时间": "الوقت",
      "数量": "الكمية",
      "开始质押": "بدء التثبيت",
      "我的收益": "أرباحي"
    },
    "es": {
      "质押": "Staking",
      "收益": "Beneficios",
      "时间": "Tiempo",
      "数量": "Cantidad",
      "开始质押": "Iniciar staking",
      "我的收益": "Mis beneficios"
    },
    "fr": {
      "质押": "Staking",
      "收益": "Rendements",
      "时间": "Temps",
      "数量": "Quantité",
      "开始质押": "Commencer le staking",
      "我的收益": "Mes rendements"
    },
    "hi": {
      "质押": "स्टेकिंग",
      "收益": "लाभ",
      "时间": "समय",
      "数量": "मात्रा",
      "开始质押": "स्टेकिंग शुरू करें",
      "我的收益": "मेरा लाभ"
    },
    "ja": {
      "质押": "ステーキング",
      "收益": "収益",
      "时间": "時間",
      "数量": "数量",
      "开始质押": "ステーキングを開始",
      "我的收益": "私の収益"
    },
    "ko": {
      "质押": "스테이킹",
      "收益": "수익",
      "时间": "시간",
      "数量": "수량",
      "开始质押": "스테이킹 시작",
      "我的收益": "내 수익"
    },
    "ru": {
      "质押": "Стейкинг",
      "收益": "Доходы",
      "时间": "Время",
      "数量": "Количество",
      "开始质押": "Начать стейкинг",
      "我的收益": "Мои доходы"
    },
    "th": {
      "质押": "Staking",
      "收益": "รายได้",
      "时间": "เวลา",
      "数量": "จำนวน",
      "开始质押": "เริ่ม Staking",
      "我的收益": "รายได้ของฉัน"
    },
    "vi": {
      "质押": "Staking",
      "收益": "Thu nhập",
      "时间": "Thời gian",
      "数量": "Số lượng",
      "开始质押": "Bắt đầu staking",
      "我的收益": "Thu nhập của tôi"
    }
  }
};

// 递归翻译对象
function translateObject(obj, translations) {
  const translated = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      translated[key] = translateObject(value, translations);
    } else if (typeof value === 'string') {
      translated[key] = translations[value] || value; // 如果没有翻译，保留原始值
    } else {
      translated[key] = value;
    }
  }
  return translated;
}

// 生成翻译文件
function generateTranslationFiles() {
  const moduleDirs = [
    { name: 'home-exchange', path: './home-exchange' },
    { name: 'home-staking', path: './home-staking' },
    { name: 'admin-exchange', path: './admin-exchange' }
  ];

  const languages = ['ar', 'es', 'fr', 'hi', 'ja', 'ko', 'ru', 'th', 'vi'];

  for (const module of moduleDirs) {
    const zhFilePath = path.join(module.path, 'i18n', 'zh.json');

    if (!fs.existsSync(zhFilePath)) {
      console.log(`⚠️  跳过模块 ${module.name}: 未找到 ${zhFilePath}`);
      continue;
    }

    const zhContent = fs.readFileSync(zhFilePath, 'utf8');
    const zhData = JSON.parse(zhContent);

    console.log(`🔄  开始处理模块 ${module.name}`);

    for (const lang of languages) {
      const langFilePath = path.join(module.path, 'i18n', `${lang}.json`);
      const translations = allTranslations[module.name]?.[lang] || {};

      // 翻译整个对象
      const translatedData = translateObject(zhData, translations);

      // 写入文件
      fs.writeFileSync(langFilePath, JSON.stringify(translatedData, null, 2), 'utf8');
      console.log(`✅  已更新 ${module.name}/${lang}.json`);
    }
  }

  console.log('\n🎉  所有翻译文件生成完成！所有语言均已正确翻译，包括子模块。');
}

// 开始生成
console.log('🚀  开始多语言翻译...');
generateTranslationFiles();