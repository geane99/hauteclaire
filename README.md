hauteclaire is a project to produce a calendar of granbluefantasy calendar.
Multiple calendars is operating only in javascript.

Calendar will be there are the following.
  Various events carried out by the Daily.
  A new event that takes place each time.


hauteclaire(�����|�W�g��)�̓O�����u���[�t�@���^�W�[�̃J�����_�[�𐶐�����v���W�F�N�g�ł��B
�����̃J�����_�[��javascript�݂̂œ��삵�Ă��܂��B

�J�����_�[�͈ȉ������݂��܂��B
  �f�C���[�ōs����e��C�x���g
  �s�x�s����V�����C�x���g
  

�����ۂɓ������͈̂ȉ��ɐݒu���Ă���܂�
http://geane.web.fc2.com/



�����{�̕������̐���
�X�}�[�g�t�H���ɂ�����Q�[���ɂ����āA�f�C���[�N�G�X�g�Ȃ�C�x���g������܂��B
����͓��ւ��Ő؂�ւ��C�x���g�ŁA������̃��[���Ɋ�Â��Ĉ�A�́i�؂�ւ��j�C�x���g�����[�v���܂��B
��������܂��傤�B

��1�F�j���N�G�X�g
  ���j���F���j�N�G�X�g
  �Ηj���F�Ηj�N�G�X�g
  ���j���F���j�N�G�X�g
  �ؗj���F�ؗj�N�G�X�g
  ���j���F���j�N�G�X�g
  �y�j���F�y�j�N�G�X�g
  ���j���F���j�N�G�X�g
  
��2�F���X�p���̃N�G�X�g
  2016/04/22�F���X�p���̃N�G�X�g1��ޖ�
  2016/04/23�F���X�p���̃N�G�X�g1��ޖ�
  2016/04/24�F���X�p���̃N�G�X�g2��ޖ�
  2016/04/25�F���X�p���̃N�G�X�g2��ޖ�
  2016/04/26�F���X�p���̃N�G�X�g3��ޖ�
  2016/04/27�F���X�p���̃N�G�X�g2��ޖ�
  2016/04/28�F���X�p���̃N�G�X�g1��ޖ�
  -- �����Ń��[�v���I���ŏ��ɖ߂� -- 
  2016/04/29�F���X�p���̃N�G�X�g1��ޖ�
  2016/04/30�F���X�p���̃N�G�X�g1��ޖ�
  ...
  
��1�ɂ����ẮA�j���ƃN�G�X�g�������N���Ă��邽�ߒ����I�ɕ�����܂��B
�������Ȃ���A��2�ɂ����Ă͓������߂���ƒ����I�ɔc���ł��Ȃ��Ȃ��Ă��܂��܂��B
�ܘ_�A���̈��X�p���̃N�G�X�g�̃X�P�W���[�����Q�[���J����Ђ̌����y�[�W
��������twitter��SNS�̌����A�J�E���g����A�i�E���X����Ă���Ηǂ��ł���
�w�ǂ����������Q�[���͑��݂��܂���B
����āA���������o�ɂ���Ē����I�ɔc���ł���J�����_�[���쐬����Ɏ�������ł��B

�Ȃ��A�����_(2016/04/22)�ɂ����ẮA�O�����u���[�t�@���^�W�[(http://granbluefantasy.jp/  �ȉ��O���u���Ɨ���)��
�C�x���g�ɂ��Ď�舵���Ă��܂��B



/* ---------------------------------------------- */
/* �t�@�C���\���F                                 */
/* ---------------------------------------------- */

site +----- bower_components             : npm�Ő������ꂽ�K�v�ȃ��C�u����
     +----- granblue_common.js           : javascript�ɂ����鋤�ʋ@�\
     |
     +----- granblue_event_calendar.html : �O���u���̒ʏ�C�x���g(�s�x�J�Â���)�\���phtml
     +----- granblue_event_calendar.css  : ��L��css
     +----- granblue_event_calendar.js   : ��L�̃R���g���[��js
     +----- granblue_event_data.json     : ��L�̃f�[�^�Z�b�g
     |
     +----- granblue_helo_calendar.html  : �f�C���[�������͈�胋�[��(�ł̃X�p��)�ɂ����ĊJ�Â����C�x���g�\���phtml
     +----- granblue_helo_calendar.css   : ��L��css
     +----- granblue_helo_calendar.js    : ��L�̃R���g���[��
     
�Ώۂ̃T�[�r�X�������Ă�����f�B���N�g�����\���͕ς��邩���m��܂���B



/* ---------------------------------------------- */
/* �g�p���Ă��郂�W���[���F                       */
/* ---------------------------------------------- */

  jQuery
  angular
  fullcalendar +---- moment
               +---- angular-ui-calendar
               +---- fullcalendar
               +---- gcal
               +---- bootstrap
               +---- bootstrap-tpls

�قڃC�x���g�̃X�P�W���[���𐶐�����̂����C���ŁAangular���̋@�\�͂�����Ƃ����g���Ă��܂���B



/* ---------------------------------------------- */
/* ���ʋ@�\js�ɂ��āF                           */
/* ---------------------------------------------- */

�ȉ������ʋ@�\�Œ�`����Ă���I�u�W�F�N�g�̊T�v�ł��B

hauteclaire +---- app (�J�����_�[���ʋ@�\)
            |      |
            |      +---- events (�C�x���g�f�[�^�i�[�ꏊ)
            |      +---- load (�l�b�g���[�N����json���擾���i�[����)
            |      +---- filter (app.events�̃f�[�^���t�B���^�����O����)
            |      +---- config
            |              |
            |              +---- resources (�l�b�g���[�N��̃��\�[�X�ݒ�)
            |              +---- target (app.filter�ɂ��Đݒ肳�������j
            |              +---- calendar (fullcalendar�̃v���p�e�B)
            |
            +---- helo (�G���W�F���w�C���[�p�@�\)
            |      |
            |      +---- groups (�G���W�F���w�C���[�̊��蓖�ăO���[�v)
            |      +---- timeline (1����n�ŕ������ꂽ�O���[�v)
            |      |        |
            |      |        +---- deviation (������猻�݂̃C�x���g���擾)
            |      |
            |      +---- rule (�G���W�F���w�C���[�̃��[�e�[�V�������[��)
            |      |        |
            |      |        +---- deviation (������猻�݂̃C�x���g���擾)
            |      |
            |      +---- generate (�C�x���g�𐶐�����)
            |
            +---- subjugation (���Ő�p�@�\)
            |      |
            |      +---- pattern (���Ő�o�����[��)
            |      +---- deviation (������猻�݂̃C�x���g���擾)
            |      +---- generate (�C�x���g�𐶐�����)
            |
            +---- ordeal (�e�펎���p�@�\)
                   |
                   +---- pattern (�e�펎���o�����[��)
                   +---- deviation (������猻�݂̃C�x���g���擾)
                   +---- generate (�C�x���g�𐶐�����)

�e��@�\�́A�����̋@�\��l�X�ȏ����őg�ݍ��킹���J�����_�[�̃C���X�^���X(html)��
�������邱�Ƃ��l�����܂��̂ŁA���ʋ@�\�ɓ���Ă��܂��B



