// Generic builder options use explicitly named reference photos, never an implied exact SKU.
function builderPartVisual(key, index) {
  const examples = {
    cooling: ['cooler-master-ml240l.png', 'Cooler Master ML240L liquid cooler'],
    cpu: ['intel-core-i5-14600k-cutout.png', 'Intel Core i5-14600K'],
    motherboard: ['msi-b760-gaming-plus-1.webp', 'MSI B760 Gaming Plus WiFi'],
    gpu: ['msi-rtx-4060-main.webp', 'MSI GeForce RTX 4060'],
    ram: ['kingston-fury-32gb-kit-cutout.png', 'Kingston FURY Beast memory kit'],
    storage: ['kingston-nv3-1000gb.png', 'Kingston NV3 NVMe SSD'],
    psu: ['corsair-rm850e.webp', 'Corsair RM850e power supply'],
    case: ['corsair-4000d-1.webp', 'Corsair 4000D desktop case'],
    monitor: ['asus-vg27aq.png', 'ASUS VG27AQ monitor'],
    keyboard: ['keychron-k8-pro-cutout.png', 'Keychron K8 Pro keyboard'],
    accessories: ['elgato-facecam-mk2-cutout.png', 'Elgato Facecam webcam']
  };
  if (key === 'gpu' && index === 0) return { image: '', caption: 'No separate graphics card selected. Check the processor’s integrated graphics support.' };
  let [file, name] = examples[key];
  if (key === 'cpu' && index >= 2) [file, name] = ['amd-ryzen-7-7700x-cutout.png', 'AMD Ryzen 7 7700X'];
  if (key === 'gpu' && index === 2) [file, name] = ['msi-4070-super-1.webp', 'MSI GeForce RTX 4070 Super'];
  if (key === 'accessories' && index === 2) [file, name] = ['logitech-g435-1.png', 'Logitech G435 headset'];
  if (key === 'accessories' && index === 0) return { image: 'images/icons/wireless-adapter.svg', caption: 'Wireless adapter illustration. Exact model appearance may vary.', details: 'WiFi and Bluetooth connectivity' };
  const exact = (key === 'cpu' && index === 0) || (key === 'motherboard' && index === 0);
  const part = pcParts[key][index];
  const details = [part.socket && 'Socket ' + part.socket, part.memory, part.size, part.watts && part.watts + 'W', part.use || part.tier, part.supports && 'Fits ' + part.supports.join(' / ')].filter(Boolean).join(' · ');
  return { image: 'images/products/' + file, caption: exact ? 'Photo of the selected model.' : 'Reference photo: ' + name + '. Exact model appearance may vary.', details };
}

function openBuilderPartPreview(key) {
  const field = document.getElementById(key);
  if (!field || field.value === '') return;
  const part = pcParts[key][Number(field.value)], visual = builderPartVisual(key, Number(field.value));
  if (!visual.image) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'builder-photo-dialog';
  dialog.setAttribute('aria-labelledby', 'builderPhotoTitle');
  dialog.innerHTML = '<button type="button" class="builder-photo-close" aria-label="Close part preview">&times;</button><p class="eyebrow">A closer look</p><h2 id="builderPhotoTitle"></h2><div class="builder-photo-stage"><img alt=""></div><p class="builder-photo-caption"></p><p class="builder-photo-specs"></p><strong class="builder-photo-price"></strong>';
  dialog.querySelector('h2').textContent = part.name;
  const image = dialog.querySelector('img'); image.src = visual.image; image.alt = visual.caption;
  dialog.querySelector('.builder-photo-caption').textContent = visual.caption;
  dialog.querySelector('.builder-photo-specs').textContent = visual.details;
  dialog.querySelector('.builder-photo-price').textContent = money(part.price);
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.body.append(dialog); dialog.showModal();
}

function updateBuilderPartPreviews() {
  document.querySelectorAll('[data-builder-choice]').forEach(choice => {
    const key = choice.dataset.builderChoice, field = choice.querySelector('select'), preview = choice.querySelector('.builder-part-preview');
    if (!preview) return;
    preview.hidden = field.value === '';
    choice.classList.toggle('has-selection', field.value !== '');
    if (field.value === '') return;
    const part = pcParts[key][Number(field.value)], visual = builderPartVisual(key, Number(field.value));
    const photo = preview.querySelector('button'), image = photo.querySelector('img');
    photo.hidden = !visual.image;
    if (visual.image) { image.src = visual.image; image.alt = visual.caption; photo.setAttribute('aria-label', 'View picture of ' + part.name); }
    preview.querySelector('.builder-part-name').textContent = part.name;
    preview.querySelector('.builder-part-price').textContent = money(part.price);
    preview.querySelector('.builder-part-details').textContent = visual.details || '';
    preview.querySelector('.builder-part-caption').textContent = visual.caption;
  });
}
