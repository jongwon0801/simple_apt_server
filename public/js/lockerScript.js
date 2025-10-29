// var HSCApplebox = function (data, cabinetColor, width, height) {
//   this.data = data; // applebox + cabinet 데이터
//   this.width = width; 
//   this.height = height; 
//   this.cabinetColor = cabinetColor;

//   var HSCRect = function (left, top, right, bottom) {
//     this.left = left; this.top = top; this.right = right; this.bottom = bottom;
//     this.getWidth = function () { return this.right - this.left; };
//     this.getHeight = function () { return this.bottom - this.top; };
//     this.shift = function (x, y) { this.left += x; this.right += x; this.top += y; this.bottom += y; };
//   };

//   var HSCCabinet = function (rect, box, color) {
//     this.loc = rect;
//     this.box = box;
//     this.color = color;
//   };

//   this.calc = function () {
//     var cabinets = [];
//     var maxHeight = this.getMaxHeight();

//     var colOffset = 0; // 시작 열
//     for (var i = 0; i < this.data.cabinet.length; i++) {
//       var cabinetBoxes = this.data.cabinet[i].box || [];
//       if (cabinetBoxes.length === 0) continue;

//       var addedWidth = 0;
//       var vHeight = 0;
//       var colWidth = cabinetBoxes[0].width || 1;

//       for (var j = 0; j < cabinetBoxes.length; j++) {
//         var box = cabinetBoxes[j];
//         if (!box) continue;

//         if (addedWidth === 0) vHeight = 0;

//         var t = vHeight; 
//         var r = colOffset + addedWidth + (box.width || 1); 
//         var b = t + (box.height || 1);

//         var rect = new HSCRect(colOffset + addedWidth, t, r, b);
//         cabinets.push(new HSCCabinet(rect, box, this.cabinetColor[box.status.charCodeAt(0) - 65]));

//         vHeight += box.height || 1;
//         addedWidth += box.width || 1;
//       }
//       colOffset += colWidth;
//     }

//     return cabinets;
//   };

//   this.getMaxHeight = function () {
//     var maxH = 0;
//     for (var i = 0; i < this.data.cabinet.length; i++) {
//       var cabinetBoxes = this.data.cabinet[i].box || [];
//       var vHeight = 0;
//       var cwidth = 0;
//       var cw = cabinetBoxes[0]?.width || 1;
//       for (var j = 0; j < cabinetBoxes.length; j++) {
//         var box = cabinetBoxes[j];
//         cwidth += box?.width || 1;
//         if (cwidth === cw) {
//           vHeight += box?.height || 1;
//           cwidth = 0;
//         }
//       }
//       if (vHeight > maxH) maxH = vHeight;
//     }
//     return maxH;
//   };
// };

// function init_viewport(j_data, cc, width, height) {
//   return new HSCApplebox(j_data, cc, width, height).calc();
// }
