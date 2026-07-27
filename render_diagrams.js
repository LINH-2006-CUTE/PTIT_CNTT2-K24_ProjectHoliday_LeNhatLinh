const fs = require('fs');
const path = require('path');
const https = require('https');

const mdPath = path.join(__dirname, 'BAO_CAO_SRS_HE_THONG_NHA_HANG.md');
const outputDir = path.join(__dirname, 'docs', 'diagram_images');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const mdContent = fs.readFileSync(mdPath, 'utf8');

const diagramNames = [
    "Hinh_A01_So_do_ERD_24_Thuc_the.png",
    "Hinh_A02_So_do_Use_Case_Tong_quan.png",
    "Hinh_A03_So_do_Luong_Nghiep_vu.png",
    "Hinh_A04_Trang_thai_Don_hang_Order.png",
    "Hinh_A05_Trang_thai_Ban_an_Table.png",
    "Hinh_A06_Trang_thai_Dat_ban_Reservation.png",
    "Hinh_A07_So_do_Site_Map_Cau_truc_Trang.png",
    "UC_AUTH_01_Sequence_Dang_ky_Dang_nhap.png",
    "UC_AUTH_02_Sequence_Doi_mat_khau.png",
    "UC_CUST_01_Sequence_Xem_Thuc_don.png",
    "UC_CUST_02_Sequence_Dat_ban_Online.png",
    "UC_CUST_03_Sequence_Dat_mon_Gio_hang.png",
    "UC_CUST_04_Sequence_Viet_Danh_gia.png",
    "UC_WAIT_01_Flowchart_Quan_ly_Ban_an.png",
    "UC_WAIT_02_Sequence_Phuc_vu_Goi_mon.png",
    "UC_CHEF_01_Sequence_Man_hinh_Bep_KDS.png",
    "UC_CHEF_02_Sequence_Cap_nhat_Che_bien.png",
    "UC_CASH_01_Sequence_Thu_ngan_POS.png",
    "UC_CASH_02_Sequence_Ma_giam_gia.png",
    "UC_MGR_01_Flowchart_Quan_ly_Thuc_don.png",
    "UC_MGR_02_Sequence_Quan_ly_Kho_PO.png",
    "UC_MGR_03_Sequence_Bao_cao_Doanh_thu.png",
    "UC_ADM_01_Sequence_Phan_quyen_Admin_RBAC.png"
];

function downloadMermaidInk(mermaidCode, filename) {
    return new Promise((resolve) => {
        // Base64url encoding for mermaid.ink
        const b64 = Buffer.from(mermaidCode.trim(), 'utf8')
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const url = `https://mermaid.ink/img/${b64}`;

        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const filePath = path.join(outputDir, filename);
                const fileStream = fs.createWriteStream(filePath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`[OK] Saved: ${filename}`);
                    resolve(filePath);
                });
            } else {
                console.error(`[FAIL] ${filename}: HTTP ${res.statusCode}`);
                resolve(null);
            }
        }).on('error', (err) => {
            console.error(`[ERR] ${filename}: ${err.message}`);
            resolve(null);
        });
    });
}

async function processAll() {
    const blockRegex = /```mermaid\s*([\s\S]*?)```/g;
    let count = 0;
    let m;
    const items = [];
    while ((m = blockRegex.exec(mdContent)) !== null) {
        const code = m[1];
        const filename = diagramNames[count] || `diagram_${String(count + 1).padStart(2, '0')}.png`;
        items.push({ code, filename });
        count++;
    }

    console.log(`Downloading ${items.length} diagrams from Mermaid.ink (Base64URL)...`);
    for (const item of items) {
        await downloadMermaidInk(item.code, item.filename);
        await new Promise(r => setTimeout(r, 300));
    }
    console.log(`Finished rendering diagrams.`);
}

processAll();
