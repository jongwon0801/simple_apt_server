var HSCApplebox = function (data, cabinetColor, width, height) {
  this.data = data;
  this.width = width;
  this.height = height;
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
  this.getRatio = function (ow, oh, tw, th) {
    // fit size(tw,th 중 하나에 fit)
    //console.log(ow,oh,tw,th);
    r1 = tw / ow;
    r2 = th / oh;

    var mv = Math.min(r1, r2);
    //console.log(ow*mv,oh*mv);
    var v = new HSCRect(0, 0, ow * mv, oh * mv);
    //console.log(v);
    return v;
  };
  //this.target_id_str= target_id_str;
  this.cabinetColor = cabinetColor;

  this.getMaxHeight = function () {
    // 열중 제일 긴 높이
    maxHeight = 0;
    for (i = 0; i < this.data.cabinet.length; i++) {
      var vHeight = 0;
      cwidth = 0;
      var cw = 0;
      for (j = 0; j < this.data.cabinet[i].box.length; j++) {
        var box = this.data.cabinet[i].box[j];
        if (j == 0) cw = box.width;
        cwidth += box.width;
        if (cw == cwidth) {
          vHeight += box.height;
          cwidth = 0;
        }
      }
      // console.log(vHeight);
      if (maxHeight < vHeight) {
        maxHeight = vHeight;
      }
    }

    return maxHeight;
  };

  this.maxHeight = this.getMaxHeight(); // 열중 제일 큰 거의 높이
  //console.log('hiehgt',this.maxHeight);

  this.calc = function () {
    var pTotalWidth = 0;
    var sTotalWidth = 0;
    for (i = 0; i < this.data.cabinet.length; i++) {
      pTotalWidth += this.data.cabinet[i].box[0].width;
      sTotalWidth +=
        (this.data.cabinet[i].box[0].width * pTotalWidth) / this.width;
    }
    // label height;
    var TOP_LABEL_HEIGHT = 30;
    //locker's physical size
    var realRect = new HSCRect(0, 0, pTotalWidth, this.maxHeight);

    // user defined screen size
    var screen = new HSCRect(0, 0, sTotalWidth, this.height - TOP_LABEL_HEIGHT);

    // user defiend screen size to  fit size
    var sout = this.getRatio(
      realRect.getWidth(),
      realRect.getHeight(),
      screen.width,
      screen.height
    );

    //sout.height:realRect.height=TOP_LABEL_HEIGHT

    //val = realRect.height*TOP_LABEL_HEIGHT/sout.height;

    //var LEFT_MARGIN = parseInt(Math.abs(screen.getWidth()-sout.getWidth())/2); // physical size;
    var LEFT_MARGIN = 0;

    this.cabinets = [];
    self = this;
    var l = 0;
    for (i = 0; i < this.data.cabinet.length; i++) {
      var addedWidth = 0,
        vHeight = 0;
      var cw = this.data.cabinet[i].box[0].width;

      var source = new HSCRect(
        l,
        0,
        l + cw,
        (realRect.height * TOP_LABEL_HEIGHT) / sout.height
      );
      result = this.dconvert(realRect, source, sout);
      result.shift(LEFT_MARGIN, 0);
      self.cabinets.push(
        new HSCCabinet(
          result,
          { label: this.data.cabinet[i].label },
          (this.color = "white")
        )
      );
      for (j = 0; j < this.data.cabinet[i].box.length; j++) {
        var box = this.data.cabinet[i].box[j];
        if (addedWidth == 0) {
          vHeight += box.height;
        }

        t = this.maxHeight - vHeight; // top
        r = l + addedWidth + box.width; // 베이스 오른쪽 라인 // right
        b = t + box.height; // bottom

        var source = new HSCRect(l + addedWidth, t, r, b);
        result = this.dconvert(realRect, source, sout); // left, top right bottom
        //result.shiftRight(LEFT_MARGIN);
        //result.shiftBottom(TOP_LABEL_HEIGHT);
        result.shift(LEFT_MARGIN, TOP_LABEL_HEIGHT);
        addedWidth += box.width;

        if (addedWidth == cw) {
          addedWidth = 0;
        }
        self.cabinets.push(
          new HSCCabinet(
            result,
            box,
            (this.color = this.cabinetColor[box.status.charCodeAt(0) - 65])
          )
        );
      }
      l = l + cw;
    }

    //console.log(this.cabinets);
    return this.cabinets;
  };
};

var HSCCabinet = function (location, box, color) {
  this.loc = location;
  this.box = box;
  this.color = color;
};
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
  this.width = this.getWidth();
  this.height = this.getHeight();
  this.shift = function (x, y) {
    this.shiftRight(x);
    this.shiftBottom(y);
  };
  this.shiftRight = function (av) {
    this.left += av;
    this.right += av;
  };
  this.shiftBottom = function (av) {
    this.top += av;
    this.bottom += av;
  };
};

function init_viewport(j_data, cc, width, height) {
  //console.log(width*j_data.cabinet.length);
  return new HSCApplebox(j_data, cc, width, height).calc();
}
