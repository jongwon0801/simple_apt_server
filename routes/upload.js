const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const dateFormat = require("dateformat");

const router = express.Router({ caseSensitive: true });

// 업로드 기본 경로 (환경변수 지원)
const BASE_PATH = process.env.UPLOAD_PATH || "/mnt/a/uploads/";
const TEMP_PATH = path.join(BASE_PATH, "temp");
const FILES_PATH = path.join(BASE_PATH, "files");

// 디렉토리 없으면 생성
fs.mkdirSync(TEMP_PATH, { recursive: true });
fs.mkdirSync(FILES_PATH, { recursive: true });

// -----------------------------
// multer 설정
// -----------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_PATH),
  filename: (req, file, cb) => {
    const key =
      (req.body.group || "gp") +
      dateFormat(new Date(), "yymmddHHMMssl") +
      randomString(2);
    cb(null, key);
  },
});

const upload = multer({ storage });

// -----------------------------
// 유틸 함수
// -----------------------------
function randomString(len) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: len },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function moveToPermanent(fileKey) {
  return new Promise((resolve, reject) => {
    try {
      const tempFile = path.join(TEMP_PATH, fileKey);
      const tempMeta = path.join(TEMP_PATH, fileKey + ".json");
      if (!fs.existsSync(tempFile) || !fs.existsSync(tempMeta)) {
        return reject("File not found in temp");
      }

      const meta = JSON.parse(fs.readFileSync(tempMeta));
      const group = fileKey.substring(0, 2);
      const dir = fileKey.substring(2, 8);
      const destDir = path.join(FILES_PATH, group, dir, fileKey);

      fs.mkdirSync(destDir, { recursive: true });

      meta.path = `/uploads/files/${group}/${dir}/${fileKey}/`;
      fs.writeFileSync(
        path.join(destDir, fileKey + ".json"),
        JSON.stringify(meta)
      );
      fs.renameSync(tempFile, path.join(destDir, fileKey));
      fs.unlinkSync(tempMeta);

      resolve(meta);
    } catch (err) {
      reject(err);
    }
  });
}

// -----------------------------
// 라우트
// -----------------------------

// [1] 업로드
router.post("/", upload.single("file"), (req, res) => {
  const file = req.file;
  const meta = {
    size: file.size,
    group: req.body.group || "gp",
    fileKey: file.filename,
    originalname: file.originalname,
    type: file.mimetype,
    path: "/uploads/temp/",
  };

  fs.writeFileSync(
    path.join(TEMP_PATH, file.filename + ".json"),
    JSON.stringify(meta)
  );
  res.json({ success: true, meta });
});

// [2] 임시 → 영구 저장
router.get("/save/:fileKey", async (req, res) => {
  try {
    const meta = await moveToPermanent(req.params.fileKey);
    res.json({ success: true, meta });
  } catch (err) {
    res.status(500).json({ success: false, message: err.toString() });
  }
});

// [3] 파일 조회 (영구 저장소 우선, 없으면 temp)
router.get("/:fileKey", (req, res) => {
  const fileKey = req.params.fileKey;
  const group = fileKey.substring(0, 2);
  const dir = fileKey.substring(2, 8);

  const filePath = path.join(FILES_PATH, group, dir, fileKey, fileKey);
  const metaPath = path.join(
    FILES_PATH,
    group,
    dir,
    fileKey,
    fileKey + ".json"
  );
  const tempFile = path.join(TEMP_PATH, fileKey);
  const tempMeta = path.join(TEMP_PATH, fileKey + ".json");

  try {
    let fileData, meta;

    if (fs.existsSync(filePath) && fs.existsSync(metaPath)) {
      fileData = fs.readFileSync(filePath);
      meta = JSON.parse(fs.readFileSync(metaPath));
    } else if (fs.existsSync(tempFile) && fs.existsSync(tempMeta)) {
      fileData = fs.readFileSync(tempFile);
      meta = JSON.parse(fs.readFileSync(tempMeta));
    } else {
      return res.status(404).json({ message: "File not found" });
    }

    res.type(meta.type).send(fileData);
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
});

module.exports = router;
