'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Custom Real-World Rewards Bazaar & Living Gold Engine · Version 1.1
 * 
 * Strict White-Hat Economy Invariants:
 * - Real-world rewards are funded solely through earned Haven Gold (ذهب الملاذ).
 * - Zero micro-transactions; zero pay-to-win; gold cannot be bought with real fiat currency.
 * - Serves as an anti-inflation sink and intrinsic motivation bridge to real-life flourishing.
 */

const PRESET_REWARD_TEMPLATES = Object.freeze([
  {
    id: 'PRESET_COFFEE',
    titleAr: 'فنجان قهوة الصباح المختصة',
    titleEn: 'Specialty Morning Coffee',
    cost: 30,
    icon: '☕',
    descriptionAr: 'استراحة هادئة مع قهوتك المفضلة كاستحقاق للخطوات الصادقة.',
    descriptionEn: 'A mindful pause with your favorite brew in honor of honest steps.',
  },
  {
    id: 'PRESET_GAMING_HOUR',
    titleAr: 'ساعة ألعاب أو ترفيه محبب',
    titleEn: 'Guilt-Free Gaming / Hobby Hour',
    cost: 50,
    icon: '🎮',
    descriptionAr: 'ساعة استمتاع تامة دون لوم الذات أو شعور بالتقصير.',
    descriptionEn: 'One full hour of pure joyful entertainment without guilt.',
  },
  {
    id: 'PRESET_BOOK_PURCHASE',
    titleAr: 'اقتناء كتاب أو دورة معرفية',
    titleEn: 'Acquire a Book or Learning Course',
    cost: 120,
    icon: '📚',
    descriptionAr: 'تغذية العقل بمرجع جديد يثري رحلة الاستكشاف والحكمة.',
    descriptionEn: 'Feed the mind with a new book or guide enriching the journey.',
  },
  {
    id: 'PRESET_NATURE_WALK',
    titleAr: 'نزهة تأملية في الطبيعة',
    titleEn: 'Mindful Nature Walk',
    cost: 40,
    icon: '🌳',
    descriptionAr: 'المشي في الهواء الطلق واستنشاق السكينة لشحن طاقة الروح.',
    descriptionEn: 'An outdoor stroll in fresh air to restore inner vitality.',
  },
]);

class AtlasRewardsEngine {
  /**
   * Returns all available rewards combining defaults with user-defined ones.
   */
  static getAllRewards(customRewards = [], currentGold = 0) {
    const list = [...PRESET_REWARD_TEMPLATES, ...(customRewards || [])];
    return list.map(r => ({
      ...r,
      canAfford: (currentGold || 0) >= r.cost,
    }));
  }

  /**
   * Redeems a reward if current Haven Gold suffices.
   */
  static redeemReward(rewardId, customRewards = [], currentGold = 0) {
    const all = [...PRESET_REWARD_TEMPLATES, ...(customRewards || [])];
    const reward = all.find(r => r.id === rewardId);
    if (!reward) {
      return { ok: false, error: 'unknown_reward' };
    }

    if (currentGold < reward.cost) {
      return {
        ok: false,
        error: 'insufficient_gold',
        required: reward.cost,
        current: currentGold,
      };
    }

    const remainingGold = currentGold - reward.cost;
    const title = reward.titleAr || reward.title;

    return {
      ok: true,
      reward,
      deductions: reward.cost,
      remainingGold,
      chronicleAr: `استرد المسافر مكافأة [${title}] المستحقة بعد بذل الجهد؛ بارك الله في خطواتك واستمتع بوقتك.`,
      chronicleEn: `Wayfinder redeemed [${reward.titleEn || title}]; enjoy your well-earned accomplishment!`,
    };
  }

  /**
   * Adds a new custom reward created by the user.
   */
  static addReward({ title, cost = 50, icon = '🎁', description = '' }, existingRewards = []) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return { ok: false, error: 'invalid_title' };
    }
    const cleanCost = Math.max(10, Math.floor(Number(cost) || 50));
    const newReward = {
      id: `rwd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      titleAr: title.trim(),
      titleEn: title.trim(),
      cost: cleanCost,
      icon: (icon && typeof icon === 'string') ? icon.trim().slice(0, 4) : '🎁',
      descriptionAr: description ? description.trim() : 'مكافأة واقعية مخصصة',
      descriptionEn: description ? description.trim() : 'Custom real-life treat',
      isCustom: true,
    };

    return {
      ok: true,
      reward: newReward,
      updatedRewards: [newReward, ...(existingRewards || [])],
    };
  }

  /**
   * Deletes a user custom reward.
   */
  static deleteReward(rewardId, existingRewards = []) {
    const updated = (existingRewards || []).filter(r => r.id !== rewardId);
    return {
      ok: true,
      rewardId,
      updatedRewards: updated,
    };
  }
}

module.exports = {
  PRESET_REWARD_TEMPLATES,
  AtlasRewardsEngine,
};
