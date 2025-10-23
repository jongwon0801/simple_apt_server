// ==============================
// HSCApplebox
// 사물함 단말기 UI 계산용
// ==============================
var HSCApplebox = function (data, cabinetColor, width, height) {
  this.data = data; // applebox + cabinet 데이터
  this.width = width; // 화면 전체 폭
  this.height = height; // 화면 전체 높이
  this.cabinetColor = cabinetColor;

  // -----------------------------
  // HSCRect: 좌표 및 크기 처리
  // -----------------------------
  var HSCRect = function (left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.getWidth = function () {
      return this.right - this.left;
    };
    this.getHeight = function () {
      return this.bottom - this.top;
    };
    this.shift = function (x, y) {
      this.left += x;
      this.right += x;
      this.top += y;
      this.bottom += y;
    };
  };

  // -----------------------------
  // HSCCabinet: 화면 요소 단위
  // -----------------------------
  var HSCCabinet = function (rect, box, color) {
    this.loc = rect; // HSCRect 좌표
    this.box = box; // box 데이터 (label, status 등)
    this.color = color;
  };

  // -----------------------------
  // 화면 좌표 변환
  // -----------------------------
  this.dconvert = function (origin, originTarget, screen) {
    var widthRatio = screen.width / origin.width;
    var heightRatio = screen.height / origin.height;
    return new HSCRect(
      originTarget.left * widthRatio,
      originTarget.top * heightRatio,
      originTarget.right * widthRatio,
      originTarget.bottom * heightRatio
    );
  };

  // -----------------------------
  // 계산: 각 cabinet과 box 위치 계산
  // -----------------------------
  this.calc = function () {
    var cabinets = [];
    var maxHeight = this.getMaxHeight();

    // -----------------------------
    // 1. 제어열 추가 (왼쪽 1열)
    // -----------------------------
    cabinets.push(
      new HSCCabinet(
        new HSCRect(0, 0, 1, maxHeight),
        { label: "CONTROL", status: "C" },
        this.cabinetColor["C".charCodeAt(0) - 65]
      )
    );

    // -----------------------------
    // 2. 각 cabinet, box 계산
    // -----------------------------
    var colOffset = 1; // 제어열 제외
    for (var i = 0; i < this.data.cabinet.length; i++) {
      var cw = this.data.cabinet[i].box[0].width; // 열 단위 폭
      var addedWidth = 0;
      var vHeight = 0;

      for (var j = 0; j < this.data.cabinet[i].box.length; j++) {
        var box = this.data.cabinet[i].box[j];

        if (addedWidth == 0) vHeight += box.height;

        var t = maxHeight - vHeight; // top 좌표
        var r = colOffset + addedWidth + box.width; // right 좌표
        var b = t + box.height; // bottom 좌표

        var rect = new HSCRect(colOffset + addedWidth, t, r, b);
        cabinets.push(
          new HSCCabinet(
            rect,
            box,
            this.cabinetColor[box.status.charCodeAt(0) - 65]
          )
        );

        addedWidth += box.width;
        if (addedWidth == cw) addedWidth = 0;
      }

      colOffset += cw;
    }

    return cabinets;
  };

  // -----------------------------
  // 열 중 최대 높이 계산
  // -----------------------------
  this.getMaxHeight = function () {
    var maxH = 0;
    for (var i = 0; i < this.data.cabinet.length; i++) {
      var vHeight = 0;
      var cwidth = 0;
      var cw = 0;
      for (var j = 0; j < this.data.cabinet[i].box.length; j++) {
        var box = this.data.cabinet[i].box[j];
        if (j == 0) cw = box.width;
        cwidth += box.width;
        if (cwidth == cw) {
          vHeight += box.height;
          cwidth = 0;
        }
      }
      if (vHeight > maxH) maxH = vHeight;
    }
    return maxH;
  };
};

// ==============================
// 초기화 함수
// ==============================
function init_viewport(j_data, cc, width, height) {
  return new HSCApplebox(j_data, cc, width, height).calc();
}
