/** 공식 접수 주소가 확인되면 email 또는 formEndpoint를 설정하세요. */
const INQUIRY_CONFIG = { email: '', formEndpoint: '' };
const siteScript = document.querySelector('script[src$="site.js"]');
const SITE_ROOT = new URL('.', siteScript.src).pathname;
const PAGE_PATHS = new Set(['home', 'about', 'programs', 'approach', 'contact'].map((page) => `${SITE_ROOT}${page}/`));
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
const dialog = document.querySelector('#privacy-dialog');
let navigationSequence = 0;

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '메뉴 열기');
  navigation.classList.remove('open');
}

function updateSubmitLabel() {
  const buttonText = document.querySelector('.submit-button')?.firstChild;
  if (!buttonText) return;
  if (INQUIRY_CONFIG.formEndpoint) buttonText.textContent = '교육 문의 보내기 ';
  else if (INQUIRY_CONFIG.email) buttonText.textContent = '이메일로 문의하기 ';
}

function updatePageDetails(nextDocument, pathname) {
  document.title = nextDocument.title;
  for (const selector of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]']) {
    const current = document.querySelector(selector);
    const next = nextDocument.querySelector(selector);
    if (current && next) current.content = next.content;
  }
  navigation.querySelectorAll('a[aria-current]').forEach((link) => link.removeAttribute('aria-current'));
  navigation.querySelector(`a[href="${pathname}"]`)?.setAttribute('aria-current', 'page');
  updateSubmitLabel();
}

async function navigate(pathname, { push = true } = {}) {
  if (!PAGE_PATHS.has(pathname)) return;
  const sequence = ++navigationSequence;
  try {
    const response = await fetch(pathname, { headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const nextDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
    const nextMain = nextDocument.querySelector('main');
    if (!nextMain) throw new Error('Missing main content');
    if (sequence !== navigationSequence) return;
    document.querySelector('main').replaceWith(nextMain);
    updatePageDetails(nextDocument, pathname);
    if (push) history.pushState({}, '', pathname);
    closeMenu();
    window.scrollTo(0, 0);
    nextMain.setAttribute('tabindex', '-1');
    nextMain.focus({ preventScroll: true });
  } catch {
    window.location.assign(pathname);
  }
}

function showStatus(message, success = false) {
  const status = document.querySelector('#form-status');
  status.textContent = message;
  status.classList.toggle('success', success);
}

function inquiryText(data) {
  return [
    '페스티벌교육연구소 교육 문의', '',
    `이름 / 담당자명: ${data.get('name')}`,
    `기관 / 소속: ${data.get('organization') || '미입력'}`,
    `이메일: ${data.get('email')}`,
    `연락처: ${data.get('phone') || '미입력'}`,
    `관심 교육 분야: ${data.get('topic')}`, '',
    '문의 내용:', String(data.get('message')),
  ].join('\n');
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return; }
  const temp = document.createElement('textarea');
  temp.value = value;
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.append(temp);
  temp.select();
  const copied = document.execCommand('copy');
  temp.remove();
  if (!copied) throw new Error('Clipboard unavailable');
}

document.querySelector('#year').textContent = new Date().getFullYear();
updateSubmitLabel();

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button === menuButton) {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    navigation.classList.toggle('open', open);
    return;
  }
  if (button?.matches('.privacy-open')) { dialog.showModal(); return; }
  if (button?.matches('.privacy-close, .privacy-confirm')) { dialog.close(); return; }

  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || !PAGE_PATHS.has(url.pathname)) return;
  event.preventDefault();
  if (url.pathname === location.pathname) { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  navigate(url.pathname);
});

window.addEventListener('popstate', () => navigate(location.pathname, { push: false }));

document.addEventListener('submit', async (event) => {
  if (!event.target.matches('#inquiry-form')) return;
  event.preventDefault();
  const form = event.target;
  showStatus('');
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = inquiryText(data);

  if (INQUIRY_CONFIG.formEndpoint) {
    const button = form.querySelector('.submit-button');
    button.disabled = true;
    showStatus('문의를 보내고 있습니다.');
    try {
      const response = await fetch(INQUIRY_CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(data)) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      showStatus('문의가 접수되었습니다. 작성하신 이메일로 답변드리겠습니다.', true);
      form.reset();
    } catch { showStatus('접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { button.disabled = false; }
    return;
  }
  if (INQUIRY_CONFIG.email) {
    const subject = encodeURIComponent('페스티벌교육연구소 교육 문의');
    window.location.href = `mailto:${INQUIRY_CONFIG.email}?subject=${subject}&body=${encodeURIComponent(message)}`;
    showStatus('이메일 앱이 열립니다. 이메일 앱에서 보내기를 눌러 문의를 완료해 주세요.', true);
    return;
  }
  try {
    await copyText(message);
    showStatus('문의 내용이 복사되었습니다. 공식 접수 주소가 설정되면 이곳에서 바로 문의할 수 있습니다.', true);
  } catch { showStatus('접수 주소가 아직 설정되지 않았습니다. 연구소의 공식 연락처를 등록해 주세요.'); }
});
