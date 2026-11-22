'use strict';
/**
 * The second, larger part of the curated corpus: references only, exactly
 * like corpus.js. No Quranic text lives in this file.
 *
 * Each entry was chosen for a self-contained meaning and then reviewed against
 * the text the source returns, so a theme tag matches what the ayah says.
 * `npm run verify:corpus` checks every key against both sources.
 */

const E = (key, ...themes) => ({ key, themes });

const EXTENDED = [
  // -- Oneness & Majesty --------------------------------------------------
  E('2:163', 'tawhid', 'rahma'), E('3:2', 'tawhid'), E('3:18', 'tawhid', 'ilm'),
  E('6:101', 'tawhid', 'kawn'), E('6:102', 'tawhid'), E('6:103', 'tawhid'),
  E('7:54', 'tawhid', 'kawn'), E('10:3', 'tawhid', 'kawn'),   E('17:111', 'tawhid', 'dhikr'), E('20:98', 'tawhid', 'ilm'), E('22:62', 'tawhid'),
  E('23:116', 'tawhid'), E('25:2', 'tawhid', 'kawn'), E('27:60', 'tawhid', 'kawn'),
  E('27:61', 'tawhid', 'kawn'), E('27:63', 'tawhid', 'kawn'), E('27:64', 'tawhid', 'rizq'),
  E('28:70', 'tawhid', 'shukr'), E('30:40', 'tawhid', 'rizq'), E('35:3', 'tawhid', 'rizq'),
  E('35:41', 'tawhid', 'kawn'), E('39:62', 'tawhid'), E('39:67', 'tawhid'),
  E('40:62', 'tawhid'), E('40:65', 'tawhid', 'dua'), E('43:84', 'tawhid'),
  E('45:36', 'tawhid', 'shukr'), E('45:37', 'tawhid'), E('50:16', 'tawhid', 'taqwa'),
  E('57:4', 'tawhid', 'taqwa'), E('64:1', 'tawhid', 'dhikr'), E('85:14', 'tawhid', 'rahma'),
  E('87:1', 'tawhid', 'dhikr'), E('96:1', 'tawhid', 'ilm'), E('2:115', 'tawhid'),
  E('6:18', 'tawhid'), E('10:31', 'tawhid', 'rizq'), E('16:17', 'tawhid', 'ilm'),

  // -- Mercy, Forgiveness, Repentance --------------------------------------
  E('2:37', 'rahma'), E('2:160', 'rahma'), E('3:31', 'rahma'), E('4:17', 'rahma'),
  E('4:27', 'rahma'), E('4:106', 'rahma', 'dua'), E('5:74', 'rahma'), E('6:12', 'rahma', 'akhirah'),
  E('7:23', 'rahma', 'dua'), E('11:3', 'rahma', 'rizq'), E('11:90', 'rahma'), E('12:92', 'rahma', 'akhlaq'),
  E('15:49', 'rahma'), E('16:119', 'rahma'), E('17:25', 'rahma'), E('18:58', 'rahma'),
  E('25:70', 'rahma'), E('25:71', 'rahma'), E('40:3', 'rahma'), E('42:30', 'rahma', 'hikma'),
  E('110:3', 'rahma', 'dhikr'), E('7:153', 'rahma'), E('9:104', 'rahma'),
  E('16:18', 'rahma', 'shukr'),   E('35:30', 'rahma', 'shukr'), E('40:7', 'rahma', 'dua'), E('48:14', 'rahma'),
  E('57:28', 'rahma', 'taqwa'), 
  // -- Patience & Trial -----------------------------------------------------
  E('2:45', 'sabr', 'salah'), E('3:139', 'sabr'), E('3:142', 'sabr', 'akhirah'), E('3:146', 'sabr'),
  E('6:34', 'sabr'), E('10:109', 'sabr'), E('11:11', 'sabr', 'amal'), E('11:49', 'sabr', 'taqwa'),
  E('11:115', 'sabr'), E('12:90', 'sabr', 'taqwa'), E('13:22', 'sabr', 'akhlaq'), E('13:24', 'sabr', 'akhirah'),
  E('16:96', 'sabr'), E('16:126', 'sabr', 'akhlaq'), E('20:130', 'sabr', 'dhikr'), E('30:60', 'sabr', 'tawakkul'),
  E('31:17', 'sabr', 'salah'), E('40:55', 'sabr', 'dhikr'), E('41:35', 'sabr', 'akhlaq'), E('46:35', 'sabr'),
  E('47:31', 'sabr'), E('50:39', 'sabr', 'dhikr'), E('52:48', 'sabr', 'dhikr'), E('70:5', 'sabr'),
  E('73:10', 'sabr', 'akhlaq'), E('74:7', 'sabr'), E('76:24', 'sabr'), E('103:3', 'sabr', 'ukhuwa'),
  E('3:120', 'sabr', 'taqwa'), E('12:83', 'sabr', 'tawakkul'), E('12:86', 'sabr', 'dua'), E('2:250', 'sabr', 'dua'),
  E('39:10', 'sabr'), E('2:177', 'taqwa', 'akhlaq', 'sabr'),

  // -- Trust in God -----------------------------------------------------------
  E('3:160', 'tawakkul'), E('5:23', 'tawakkul'), E('8:2', 'tawakkul', 'dhikr'),
  E('9:129', 'tawakkul', 'dhikr'), E('10:107', 'tawakkul'), E('11:56', 'tawakkul'), E('11:123', 'tawakkul', 'tawhid'),
  E('12:67', 'tawakkul'), E('14:11', 'tawakkul'), E('25:58', 'tawakkul', 'dhikr'), E('26:217', 'tawakkul'),
  E('27:79', 'tawakkul'), E('39:36', 'tawakkul'), E('39:38', 'tawakkul'), E('58:10', 'tawakkul'),
  E('64:13', 'tawakkul', 'tawhid'), E('67:29', 'tawakkul', 'rahma'), E('73:9', 'tawakkul', 'tawhid'),
  E('6:17', 'tawakkul'), E('10:62', 'tawakkul', 'taqwa'), E('10:63', 'tawakkul', 'taqwa'), E('10:64', 'tawakkul', 'akhirah'),
  E('12:64', 'tawakkul', 'rahma'), E('14:12', 'tawakkul'), E('33:48', 'tawakkul', 'akhlaq'),
  E('65:3', 'tawakkul'), E('3:126', 'tawakkul'),

  // -- Provision ---------------------------------------------------------------
  E('2:261', 'rizq', 'amal'), E('2:268', 'rizq'), E('2:274', 'rizq', 'akhlaq'), E('2:276', 'rizq'),
  E('15:21', 'rizq', 'tawhid'), E('17:30', 'rizq'), E('20:131', 'rizq', 'hikma'), E('20:132', 'rizq', 'salah'),
  E('24:38', 'rizq', 'salah'), E('29:62', 'rizq'), E('30:37', 'rizq'), E('30:39', 'rizq', 'akhlaq'),
  E('34:39', 'rizq', 'akhlaq'), E('35:2', 'rizq', 'rahma'), E('42:27', 'rizq', 'hikma'), E('51:58', 'rizq', 'tawhid'),
  E('65:7', 'rizq', 'hikma'), E('71:11', 'rizq', 'rahma'), E('71:12', 'rizq'),
  E('64:17', 'rizq', 'akhlaq'), E('2:245', 'rizq'), E('57:7', 'rizq', 'amal'), E('63:10', 'rizq', 'akhirah'),
  E('3:92', 'rizq', 'akhlaq'), E('2:272', 'rizq'), E('16:72', 'rizq', 'shukr'), 
  // -- Remembrance & Calm ----------------------------------------------------------
  E('4:103', 'dhikr', 'salah'), E('20:124', 'dhikr', 'akhirah'), E('24:37', 'dhikr', 'salah'),
  E('33:35', 'dhikr', 'taqwa'), E('33:42', 'dhikr'), E('33:43', 'dhikr', 'rahma'), E('39:23', 'dhikr', 'ilm'),
  E('39:22', 'dhikr'), E('57:16', 'dhikr', 'taqwa'), E('87:15', 'dhikr', 'salah'), E('50:40', 'dhikr'),
  E('52:49', 'dhikr'), E('76:25', 'dhikr'), E('76:26', 'dhikr', 'salah'), E('30:17', 'dhikr'), E('30:18', 'dhikr'),
  E('15:98', 'dhikr', 'salah'), E('15:99', 'dhikr'), E('17:44', 'dhikr', 'kawn'), E('24:41', 'dhikr', 'kawn'),
  E('57:1', 'dhikr', 'tawhid'), E('62:1', 'dhikr', 'jumua'), E('7:180', 'dhikr', 'tawhid'),
  E('62:10', 'dhikr', 'amal'), E('48:9', 'dhikr'),
  E('56:74', 'dhikr'), E('56:96', 'dhikr'), E('69:52', 'dhikr'),

  // -- Supplication ---------------------------------------------------------------
  E('1:5', 'dua', 'tawhid'), E('1:6', 'dua'), E('2:127', 'dua'), E('2:128', 'dua'),
  E('3:8', 'dua'), E('3:9', 'dua', 'akhirah'), E('3:16', 'dua', 'rahma'), E('3:38', 'dua'),
  E('3:53', 'dua'), E('3:147', 'dua', 'rahma'), E('3:193', 'dua'), E('3:194', 'dua', 'akhirah'),
  E('7:126', 'dua', 'sabr'), E('7:151', 'dua', 'rahma'), E('10:85', 'dua', 'tawakkul'), E('11:47', 'dua', 'rahma'),
  E('12:101', 'dua', 'shukr'), E('14:35', 'dua'), E('14:41', 'dua', 'walidayn'), E('20:25', 'dua'),
  E('21:83', 'dua', 'sabr', 'rahma'), E('21:89', 'dua'), E('23:29', 'dua'), E('23:97', 'dua'), E('23:98', 'dua'),
  E('23:109', 'dua', 'rahma'), E('25:65', 'dua', 'akhirah'), E('26:83', 'dua', 'ilm'), E('26:85', 'dua', 'akhirah'),
  E('28:16', 'dua', 'rahma'), E('28:21', 'dua'), E('37:100', 'dua'), E('40:8', 'dua', 'akhirah'),
  E('59:10', 'dua', 'ukhuwa'), E('66:11', 'dua', 'akhirah'), E('71:28', 'dua', 'walidayn'),
  E('3:192', 'dua', 'akhirah'), E('2:285', 'dua', 'tawhid'),   E('7:47', 'dua', 'akhirah'), E('21:88', 'dua', 'rahma'), E('17:80', 'dua'), E('26:87', 'dua', 'akhirah'),

  // -- Knowledge & Reflection -------------------------------------------------------
  E('4:82', 'ilm'), E('17:85', 'ilm'), E('18:109', 'ilm', 'tawhid'),
  E('22:46', 'ilm'), E('29:43', 'ilm'), E('31:27', 'ilm', 'tawhid'), E('54:17', 'ilm', 'dhikr'),
  E('96:3', 'ilm'), E('96:4', 'ilm'), E('96:5', 'ilm'), E('10:101', 'ilm', 'kawn'),
  E('12:111', 'ilm', 'hikma'), E('16:78', 'ilm', 'shukr'), E('30:8', 'ilm', 'kawn'),   E('3:79', 'ilm'), E('35:28', 'ilm', 'taqwa'),
  E('20:113', 'ilm'), E('50:37', 'ilm', 'dhikr'), E('2:151', 'ilm', 'shukr'),

  // -- Character & Conduct ------------------------------------------------------------
  E('4:36', 'akhlaq', 'walidayn'), E('4:86', 'akhlaq'), E('4:135', 'akhlaq', 'taqwa'), E('4:148', 'akhlaq'),
  E('5:8', 'akhlaq', 'taqwa'), E('6:151', 'akhlaq', 'walidayn'), E('6:152', 'akhlaq'), E('7:199', 'akhlaq'),
  E('16:125', 'akhlaq', 'hikma'), E('17:26', 'akhlaq'), E('17:27', 'akhlaq'), E('17:29', 'akhlaq', 'rizq'),
  E('17:34', 'akhlaq'), E('17:35', 'akhlaq', 'amal'), E('17:37', 'akhlaq'), E('23:96', 'akhlaq'),
  E('24:27', 'akhlaq'), E('25:72', 'akhlaq'), E('28:55', 'akhlaq'), E('42:37', 'akhlaq'),
  E('42:40', 'akhlaq', 'rahma'), E('42:43', 'akhlaq', 'sabr'), E('49:6', 'akhlaq', 'ilm'), E('60:8', 'akhlaq'),
  E('83:1', 'akhlaq'), E('104:1', 'akhlaq'), E('2:188', 'akhlaq'), E('5:32', 'akhlaq'),
  E('6:108', 'akhlaq', 'hikma'), E('16:91', 'akhlaq'), E('17:32', 'akhlaq', 'taqwa'), E('23:3', 'akhlaq'),
  E('23:8', 'akhlaq'), E('25:67', 'akhlaq', 'rizq'), E('4:29', 'akhlaq'), E('4:114', 'akhlaq', 'ukhuwa'),
  E('57:23', 'akhlaq', 'hikma'), E('2:224', 'akhlaq'), E('3:134', 'akhlaq'),   E('7:31', 'akhlaq'), E('17:36', 'akhlaq', 'ilm'), E('24:30', 'akhlaq', 'taqwa'), E('49:12', 'akhlaq'),
  E('68:4', 'akhlaq'), E('76:8', 'akhlaq', 'rizq'), E('76:9', 'akhlaq'),   E('93:9', 'akhlaq'), E('93:10', 'akhlaq'),

  // -- God-consciousness ------------------------------------------------------------
  E('3:133', 'taqwa', 'amal'), E('5:35', 'taqwa'), E('8:29', 'taqwa', 'ilm'), E('9:119', 'taqwa', 'akhlaq'),
  E('11:112', 'taqwa'), E('16:128', 'taqwa', 'akhlaq'), E('46:13', 'taqwa'), E('59:18', 'taqwa', 'akhirah'),
  E('65:5', 'taqwa', 'rahma'), E('2:281', 'taqwa', 'akhirah'), E('3:76', 'taqwa', 'akhlaq'),
  E('7:96', 'taqwa', 'rizq'), E('7:201', 'taqwa', 'dhikr'), E('47:17', 'taqwa'), E('78:31', 'taqwa', 'akhirah'),
  E('2:2', 'taqwa', 'ilm'), E('7:26', 'taqwa'),
  E('22:37', 'taqwa'), E('33:71', 'taqwa'), E('39:61', 'taqwa'),   E('50:33', 'taqwa'), E('79:40', 'taqwa', 'akhirah'), E('79:41', 'taqwa', 'akhirah'), E('91:9', 'taqwa'),
  E('91:10', 'taqwa'),

  // -- Gratitude ------------------------------------------------------------------------
  E('16:53', 'shukr'), E('16:114', 'shukr', 'rizq'), E('76:3', 'shukr', 'hikma'),
  E('93:11', 'shukr'), E('39:66', 'shukr', 'tawhid'), E('4:147', 'shukr', 'rahma'), E('7:10', 'shukr', 'rizq'),
  E('23:78', 'shukr', 'ilm'), E('67:23', 'shukr'), E('106:3', 'shukr', 'salah'),
  E('106:4', 'shukr', 'rizq'), E('108:1', 'shukr'), E('17:70', 'shukr'), E('31:20', 'shukr', 'kawn'),
  E('45:12', 'shukr', 'kawn'), E('45:13', 'shukr', 'kawn'), E('2:172', 'shukr', 'rizq'), E('14:34', 'shukr'),
  E('27:73', 'shukr'), E('40:61', 'shukr', 'kawn'), E('46:15', 'shukr', 'walidayn'),

  // -- Work & Excellence ------------------------------------------------------------------
  E('18:110', 'amal', 'tawhid'), E('53:40', 'amal'), E('99:8', 'amal', 'akhirah'),
  E('4:124', 'amal'), E('6:132', 'amal'),   E('18:7', 'amal', 'hikma'), E('20:112', 'amal'), E('21:94', 'amal'), E('35:10', 'amal', 'dhikr'),
  E('37:61', 'amal'), E('40:40', 'amal'), E('45:15', 'amal'), E('46:19', 'amal'),
  E('94:7', 'amal'), E('94:8', 'amal', 'dua'), E('17:84', 'amal'), E('2:148', 'amal'),
  E('57:21', 'amal', 'akhirah'), E('2:110', 'amal', 'salah'),   E('23:61', 'amal'), E('35:32', 'amal'), E('98:7', 'amal'), E('41:46', 'amal'),

  // -- The Hereafter -------------------------------------------------------------------------
  E('6:32', 'akhirah'), E('13:26', 'akhirah', 'rizq'), E('17:19', 'akhirah', 'amal'),
  E('21:1', 'akhirah'), E('21:47', 'akhirah', 'amal'),   E('29:57', 'akhirah'), E('36:54', 'akhirah', 'amal'), E('40:39', 'akhirah'), E('42:20', 'akhirah', 'amal'),
  E('47:36', 'akhirah'), E('59:20', 'akhirah'), E('62:8', 'akhirah'), E('75:20', 'akhirah'),
  E('80:34', 'akhirah'), E('82:19', 'akhirah'), E('87:17', 'akhirah'), E('89:27', 'akhirah', 'dhikr'),
  E('89:28', 'akhirah', 'rahma'), E('89:30', 'akhirah'), E('93:4', 'akhirah', 'hikma'), E('99:6', 'akhirah', 'amal'),
  E('102:8', 'akhirah', 'shukr'), E('3:198', 'akhirah', 'taqwa'), E('3:15', 'akhirah', 'taqwa'), E('9:72', 'akhirah', 'rahma'),
  E('32:17', 'akhirah', 'amal'), E('43:71', 'akhirah'), E('50:31', 'akhirah', 'taqwa'), E('55:46', 'akhirah', 'taqwa'),
  E('55:60', 'akhirah', 'akhlaq'), E('76:12', 'akhirah', 'sabr'), E('10:9', 'akhirah', 'amal'), E('36:58', 'akhirah', 'rahma'),
  E('41:31', 'akhirah'), E('13:35', 'akhirah', 'taqwa'), E('3:133', 'akhirah', 'amal'), E('18:49', 'akhirah', 'amal'),
  E('21:35', 'akhirah', 'sabr'), E('31:34', 'akhirah', 'ilm'), E('56:10', 'akhirah', 'amal'),   E('69:24', 'akhirah', 'amal'), E('78:40', 'akhirah'), E('100:9', 'akhirah'),   
  // -- Brotherhood & Reconciliation -----------------------------------------------------------
  E('3:105', 'ukhuwa'), E('8:63', 'ukhuwa', 'rahma'), E('9:71', 'ukhuwa', 'akhlaq'),   E('3:104', 'ukhuwa', 'akhlaq'), E('3:110', 'ukhuwa', 'akhlaq'), E('42:38', 'ukhuwa', 'salah'),
  E('4:1', 'ukhuwa', 'taqwa'), E('30:21', 'ukhuwa', 'rahma'), E('25:54', 'ukhuwa', 'kawn'),
  E('6:159', 'ukhuwa'), E('23:52', 'ukhuwa', 'taqwa'),

  // -- Prayer & Humility --------------------------------------------------------------------------
  E('2:238', 'salah'), E('11:114', 'salah', 'rahma'), E('17:78', 'salah'), E('23:2', 'salah'),
  E('23:9', 'salah'), E('70:23', 'salah'), E('70:34', 'salah'), E('2:43', 'salah'),
  E('22:77', 'salah', 'amal'), E('98:5', 'salah', 'tawhid'), E('108:2', 'salah', 'shukr'), E('96:19', 'salah'),
  E('20:14', 'salah', 'dhikr'), E('14:31', 'salah', 'rizq'), E('2:3', 'salah', 'rizq'),
  E('8:3', 'salah'), E('31:4', 'salah', 'akhirah'), E('7:29', 'salah', 'tawhid'), E('17:110', 'salah', 'dhikr'),
  E('25:64', 'salah'), E('51:18', 'salah', 'rahma'), E('32:15', 'salah', 'dhikr'),

  // -- Signs in Creation ---------------------------------------------------------------------------
  E('3:190', 'kawn', 'ilm'), E('6:95', 'kawn'), E('6:96', 'kawn'), E('6:97', 'kawn'), E('6:99', 'kawn', 'shukr'),
  E('10:5', 'kawn', 'ilm'), E('10:6', 'kawn'), E('13:3', 'kawn'), E('13:4', 'kawn'),
  E('15:16', 'kawn'), E('16:65', 'kawn'), E('16:66', 'kawn', 'shukr'), E('16:68', 'kawn'), E('16:69', 'kawn', 'shukr'),
  E('16:79', 'kawn'), E('21:33', 'kawn'), E('24:43', 'kawn'), E('24:44', 'kawn'),
  E('25:53', 'kawn'), E('25:61', 'kawn'), E('25:62', 'kawn', 'shukr'), E('27:88', 'kawn'),
  E('30:23', 'kawn', 'shukr'), E('30:24', 'kawn'), E('30:46', 'kawn', 'shukr'), E('30:48', 'kawn'),
  E('31:10', 'kawn'), E('35:12', 'kawn', 'shukr'), E('35:27', 'kawn'), E('36:37', 'kawn'),
  E('36:38', 'kawn'), E('36:39', 'kawn'), E('36:40', 'kawn'), E('39:5', 'kawn'),
  E('41:37', 'kawn', 'tawhid'), E('42:29', 'kawn'), E('45:3', 'kawn'), E('51:47', 'kawn'),
  E('51:49', 'kawn', 'dhikr'), E('55:5', 'kawn'), E('55:19', 'kawn'), E('67:19', 'kawn', 'tawakkul'),
  E('78:6', 'kawn'), E('80:24', 'kawn', 'shukr'), E('88:18', 'kawn'), E('88:19', 'kawn'), E('88:20', 'kawn'),
  E('71:15', 'kawn'), E('71:16', 'kawn'),   E('36:36', 'kawn', 'tawhid'), E('6:38', 'kawn'), E('2:22', 'kawn', 'tawhid'),

  // -- Wisdom --------------------------------------------------------------------------------------------
  E('2:256', 'hikma'), E('4:28', 'hikma', 'rahma'), E('5:105', 'hikma'), E('6:164', 'hikma', 'amal'),
  E('8:53', 'hikma'), E('13:11', 'hikma', 'amal'), E('17:15', 'hikma', 'amal'), E('28:56', 'hikma'),
  E('31:13', 'hikma', 'tawhid'), E('31:16', 'hikma', 'amal'), E('35:18', 'hikma'), E('64:11', 'hikma', 'sabr'),
  E('14:24', 'hikma'), E('14:25', 'hikma'), E('18:39', 'hikma', 'shukr'),
  E('29:3', 'hikma', 'sabr'), E('57:22', 'hikma', 'sabr'),   E('2:269', 'hikma'), E('17:9', 'hikma', 'ilm'), E('21:18', 'hikma'),
  E('47:7', 'hikma', 'tawakkul'), E('2:155', 'hikma', 'sabr'), E('2:216', 'hikma'), E('16:61', 'hikma', 'rahma'),
  E('39:9', 'hikma', 'ilm'), E('12:108', 'hikma', 'ilm'),

  // -- Parents ------------------------------------------------------------------------------------------
  E('29:8', 'walidayn'), E('31:15', 'walidayn', 'akhlaq'), E('19:14', 'walidayn'), E('19:32', 'walidayn'),
  E('17:23', 'walidayn'), E('2:215', 'walidayn', 'rizq'),

  // -- Friday (Surat al-Kahf and Jumu'a) ------------------------------------------------------------------
  E('18:28', 'jumua', 'dhikr'), E('18:109', 'jumua', 'tawhid'), E('18:110', 'jumua', 'amal'), E('18:13', 'jumua'),
  E('18:44', 'jumua'), E('18:45', 'jumua', 'akhirah'), E('18:65', 'jumua', 'ilm'), E('18:66', 'jumua', 'ilm'),
  E('18:39', 'jumua', 'shukr'), E('62:4', 'jumua', 'rahma'), E('62:2', 'jumua', 'ilm'),

  // -- Ramadan & Fasting -------------------------------------------------------------------------------------
  E('44:3', 'ramadan'), E('97:2', 'ramadan'),
  E('97:4', 'ramadan'), E('97:5', 'ramadan'), E('2:186', 'ramadan', 'dua'), E('33:35', 'ramadan', 'taqwa'),

  // -- Extended Curated Ayat (All Surahs & Themes) -----------------------
  E('1:1', 'tawhid', 'dhikr'), E('1:2', 'tawhid', 'shukr'), E('2:21', 'tawhid', 'taqwa'), E('2:117', 'tawhid', 'kawn'),
  E('2:195', 'amal', 'akhlaq'), E('2:277', 'salah', 'amal', 'rizq'), E('2:284', 'tawhid', 'ilm'), E('3:17', 'sabr', 'taqwa', 'salah'),
  E('3:144', 'shukr', 'tawhid'), E('4:79', 'hikma', 'rahma'), E('5:16', 'ilm', 'rahma'), E('5:54', 'akhlaq', 'tawhid'),
  E('5:119', 'akhlaq', 'akhirah', 'rahma'), E('6:14', 'tawhid', 'tawakkul'), E('6:16', 'rahma', 'akhirah'), E('6:82', 'tawhid', 'taqwa'),
  E('6:125', 'ilm', 'rahma'), E('6:162', 'tawhid', 'salah', 'amal'), E('6:163', 'tawhid'), E('7:42', 'amal', 'akhirah'),
  E('7:56', 'rahma', 'dua', 'amal'), E('7:89', 'tawakkul', 'dua'), E('7:200', 'dhikr', 'taqwa'), E('7:204', 'dhikr', 'ilm', 'rahma'),
  E('7:206', 'dhikr', 'salah', 'tawhid'), E('8:24', 'amal', 'taqwa'), E('8:70', 'rahma', 'rizq'), E('9:128', 'rahma', 'akhlaq'),
  E('10:10', 'dhikr', 'shukr', 'akhirah'), E('10:25', 'rahma', 'akhirah'), E('10:57', 'rahma', 'ilm'), E('10:58', 'rahma', 'shukr'),
  E('10:67', 'kawn', 'shukr'), E('10:108', 'ilm', 'hikma'), E('12:21', 'hikma', 'tawakkul'), E('12:53', 'rahma', 'taqwa'),
  E('12:56', 'rahma', 'amal'), E('13:16', 'tawhid', 'kawn'), E('13:29', 'amal', 'akhirah'), E('14:27', 'tawhid', 'taqwa'),
  E('15:9', 'ilm', 'tawhid'), E('15:45', 'taqwa', 'akhirah'), E('15:46', 'rahma', 'akhirah'), E('15:85', 'akhlaq', 'hikma'),
  E('15:97', 'sabr', 'dhikr'), E('17:81', 'tawhid', 'hikma'), E('17:82', 'rahma', 'ilm'), E('18:108', 'akhirah'),
  E('19:4', 'dua', 'tawakkul'), E('19:5', 'dua', 'taqwa'), E('19:6', 'dua', 'shukr'), E('19:9', 'tawhid', 'rahma'),
  E('19:30', 'tawhid', 'ilm'), E('19:31', 'salah', 'akhlaq'), E('19:64', 'tawakkul', 'tawhid'), E('19:65', 'tawhid', 'sabr'),
  E('19:76', 'amal', 'akhirah'), E('19:96', 'amal', 'rahma', 'ukhuwa'), E('20:1', 'ilm', 'rahma'), E('20:2', 'rahma', 'hikma'),
  E('20:26', 'dua', 'tawakkul'), E('20:27', 'dua', 'ilm'), E('20:28', 'dua', 'ilm'), E('20:46', 'tawakkul', 'tawhid'),
  E('20:68', 'tawakkul', 'sabr'), E('21:84', 'rahma', 'dua'), E('21:90', 'dua', 'rahma', 'amal'), E('21:107', 'rahma', 'akhlaq'),
  E('22:34', 'tawhid', 'salah'), E('22:35', 'sabr', 'salah', 'rizq'), E('22:41', 'salah', 'amal', 'taqwa'), E('22:54', 'ilm', 'tawhid'),
  E('23:4', 'amal', 'rizq'), E('23:11', 'akhirah'), E('24:21', 'rahma', 'taqwa'), E('24:26', 'akhlaq', 'rahma'),
  E('24:31', 'akhlaq', 'taqwa'), E('24:51', 'tawhid', 'amal', 'akhirah'), E('24:52', 'taqwa', 'akhirah'), E('24:55', 'amal', 'tawhid', 'salah'),
  E('25:66', 'akhirah'), E('25:68', 'tawhid', 'akhlaq'), E('25:75', 'sabr', 'akhirah'), E('26:62', 'tawakkul', 'tawhid'),
  E('26:77', 'tawhid'), E('26:78', 'tawhid', 'kawn'), E('26:79', 'rizq', 'tawhid'), E('26:80', 'rahma', 'tawhid'),
  E('26:81', 'tawhid', 'akhirah'), E('26:82', 'rahma', 'akhirah'), E('26:84', 'dua', 'akhlaq'), E('27:15', 'shukr', 'ilm'),
  E('27:93', 'shukr', 'kawn'), E('28:83', 'akhirah', 'taqwa', 'akhlaq'), E('29:6', 'amal', 'tawhid'), E('29:69', 'amal', 'rahma', 'tawakkul'),
  E('31:22', 'tawakkul', 'amal'), E('33:21', 'akhlaq', 'akhirah', 'dhikr'), E('33:47', 'rahma', 'tawakkul'), E('34:13', 'shukr', 'amal'),
  E('34:15', 'shukr', 'rizq', 'rahma'), E('34:50', 'dua', 'tawhid'), E('35:15', 'tawhid', 'shukr'), E('35:29', 'amal', 'salah', 'rizq'),
  E('35:34', 'shukr', 'rahma', 'akhirah'), E('36:82', 'tawhid', 'kawn'), E('36:83', 'tawhid', 'akhirah'), E('37:180', 'tawhid', 'dhikr'),
  E('37:181', 'dhikr', 'rahma'), E('37:182', 'shukr', 'tawhid'), E('39:18', 'ilm', 'hikma'), E('39:73', 'akhirah', 'taqwa', 'rahma'),
  E('39:74', 'shukr', 'akhirah', 'amal'), E('40:64', 'tawhid', 'rizq', 'kawn'), E('41:32', 'rahma', 'akhirah'), E('41:33', 'amal', 'akhlaq'),
  E('42:23', 'rahma', 'shukr'), E('43:13', 'shukr', 'dhikr'), E('43:14', 'dhikr', 'akhirah'), E('43:67', 'taqwa', 'ukhuwa'),
  E('44:51', 'taqwa', 'akhirah'), E('44:52', 'akhirah'), E('47:19', 'ilm', 'tawhid', 'dua'), E('48:1', 'rahma', 'tawhid'),
  E('48:2', 'rahma', 'shukr'), E('48:4', 'dhikr', 'tawhid'), E('48:17', 'rahma', 'akhirah'), E('50:32', 'taqwa', 'rahma'),
  E('51:15', 'taqwa', 'akhirah'), E('51:16', 'amal', 'akhirah'), E('51:19', 'rizq', 'akhlaq'), E('51:56', 'tawhid', 'amal'),
  E('52:21', 'akhirah', 'rahma'), E('52:24', 'akhirah'), E('53:31', 'amal', 'akhirah', 'rahma'), E('53:32', 'rahma', 'taqwa'),
  E('53:38', 'amal', 'hikma'), E('53:41', 'amal', 'akhirah'), E('53:42', 'tawhid', 'akhirah'), E('53:58', 'tawhid', 'akhirah'),
  E('55:1', 'rahma', 'ilm'), E('55:2', 'ilm', 'rahma'), E('55:3', 'kawn', 'tawhid'), E('55:4', 'ilm', 'kawn'),
  E('55:27', 'tawhid'), E('56:11', 'akhirah', 'rahma'), E('56:88', 'akhirah', 'rahma'), E('56:89', 'akhirah', 'rahma'),
  E('57:12', 'akhirah', 'rahma'), E('58:22', 'tawhid', 'akhirah', 'rahma'), E('59:19', 'dhikr', 'taqwa'), E('59:21', 'ilm', 'dhikr'),
  E('60:4', 'tawakkul', 'dua'), E('61:4', 'ukhuwa', 'amal'), E('61:13', 'rahma', 'rizq'), E('62:11', 'rizq', 'tawhid'),
  E('64:12', 'tawhid', 'tawakkul'), E('65:12', 'kawn', 'ilm', 'tawhid'), E('66:6', 'taqwa', 'amal'), E('67:12', 'taqwa', 'rahma', 'akhirah'),
  E('67:13', 'ilm', 'tawhid'), E('67:14', 'tawhid', 'ilm'), E('67:30', 'shukr', 'rizq', 'tawhid'), E('68:32', 'dua', 'rahma'),
  E('69:19', 'akhirah', 'amal'), E('69:20', 'akhirah'), E('69:21', 'akhirah', 'rahma'), E('69:22', 'akhirah'),
  E('69:23', 'akhirah'), E('70:19', 'hikma'), E('70:20', 'sabr', 'hikma'), E('70:21', 'hikma', 'rizq'),
  E('70:22', 'salah'), E('71:13', 'tawhid', 'taqwa'), E('72:13', 'tawhid', 'amal'), E('73:4', 'salah', 'dhikr'),
  E('73:8', 'dhikr', 'tawhid'), E('73:20', 'salah', 'rizq', 'rahma'), E('74:1', 'amal'), E('74:2', 'amal'),
  E('74:3', 'tawhid'), E('74:4', 'akhlaq'), E('74:5', 'taqwa'), E('74:6', 'akhlaq', 'amal'),
  E('75:14', 'hikma', 'ilm'), E('75:15', 'hikma'), E('76:21', 'akhirah', 'rahma'), E('76:22', 'amal', 'shukr', 'akhirah'),
  E('77:41', 'taqwa', 'akhirah'), E('77:42', 'akhirah', 'rizq'), E('78:32', 'akhirah'), E('80:38', 'akhirah', 'rahma'),
  E('80:39', 'akhirah', 'shukr'), E('81:27', 'dhikr', 'ilm'), E('81:28', 'amal', 'taqwa'), E('81:29', 'tawhid'),
  E('82:6', 'tawhid', 'rahma'), E('83:18', 'akhirah', 'amal'), E('83:19', 'ilm', 'akhirah'), E('83:22', 'akhirah', 'rahma'),
  E('83:26', 'amal', 'akhirah'), E('84:6', 'amal', 'akhirah'), E('85:11', 'amal', 'akhirah'), E('85:12', 'tawhid'),
  E('85:13', 'tawhid', 'kawn'), E('85:15', 'tawhid'), E('85:16', 'tawhid'), E('86:4', 'tawhid', 'taqwa'),
  E('86:13', 'ilm', 'hikma'), E('86:14', 'hikma'), E('87:9', 'dhikr', 'ilm'), E('88:8', 'akhirah', 'rahma'),
  E('88:9', 'amal', 'akhirah'), E('88:10', 'akhirah'), E('88:21', 'dhikr', 'hikma'), E('88:22', 'hikma'),
  E('89:29', 'rahma', 'ukhuwa', 'akhirah'), E('90:17', 'sabr', 'rahma', 'ukhuwa'), E('90:18', 'akhirah', 'amal'), E('92:5', 'rizq', 'taqwa'),
  E('92:6', 'amal', 'akhirah'), E('92:7', 'rahma', 'rizq'), E('92:17', 'taqwa', 'akhirah'), E('92:18', 'rizq', 'taqwa'),
  E('92:19', 'akhlaq', 'shukr'), E('92:20', 'tawhid', 'amal'), E('92:21', 'shukr', 'akhirah', 'rahma'), E('93:6', 'rahma', 'shukr'),
  E('93:7', 'rahma', 'ilm'), E('93:8', 'rizq', 'rahma'), E('94:2', 'rahma'), E('94:3', 'rahma'),
  E('94:4', 'dhikr', 'shukr'), E('95:4', 'kawn', 'tawhid'), E('95:6', 'amal', 'akhirah'), E('96:2', 'kawn', 'tawhid'),
  E('98:8', 'akhirah', 'rahma', 'taqwa'), E('100:6', 'shukr', 'hikma'), E('101:6', 'amal', 'akhirah'), E('101:7', 'akhirah', 'rahma'),
  E('102:2', 'akhirah'), E('103:1', 'hikma'), E('103:2', 'hikma', 'akhirah'), E('105:1', 'tawhid', 'hikma'),
  E('107:1', 'akhlaq', 'hikma'), E('107:2', 'akhlaq', 'rahma'), E('107:3', 'akhlaq', 'rizq'), E('107:7', 'akhlaq', 'amal'),
  E('108:3', 'rahma'), E('109:6', 'tawhid'), E('110:1', 'rahma', 'shukr'), E('110:2', 'rahma', 'tawhid'),
  E('112:2', 'tawhid'), E('112:3', 'tawhid'), E('112:4', 'tawhid'), E('113:1', 'tawhid', 'dua'),
  E('113:2', 'dua', 'tawakkul'), E('113:5', 'dua', 'tawakkul'), E('114:1', 'tawhid', 'dua'), E('114:2', 'tawhid'),
  E('114:3', 'tawhid'),
];

module.exports = { EXTENDED };
