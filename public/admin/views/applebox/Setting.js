angular.module("inspinia")
.controller("AppleboxSettingCtrl", function ($scope, $http, $stateParams) {
  $scope.yid = $stateParams.yid;

  // 기본 락커 크기 (데이터에 없는 경우 기본값용)
  $scope.lockerWidth = 200;
  $scope.lockerHeight = 200;

  // 락커 전체 삭제 함수
  $scope.deleteAllLockers = function () {
    if (!confirm("정말 모든 락커를 삭제하시겠습니까?")) return;
    $http.delete(`/api/locker/lockerCrud/all/${$scope.yid}`)
      .then(() => $scope.loadLockers())
      .catch(err => console.error("전체 삭제 오류:", err));
  };

  // 락커 불러오기 및 위치 계산
  $scope.loadLockers = function () {
    $http.get(`/api/locker/lockerCrud/${$scope.yid}`)
      .then(res => {
        const allLockersData = res.data || [];
        const processedLockers = [];
        const padding = 10;

        // 최대 col과 row 인덱스 계산
        let maxColIndex = 0;
        let maxRowIndex = 0;
        allLockersData.forEach(locker => {
          maxColIndex = Math.max(maxColIndex, (locker.col || 1) - 1);
          // row 값은 Math.floor를 적용하여 정수형 인덱스 기준으로 계산
          maxRowIndex = Math.max(maxRowIndex, Math.floor(locker.row || 1) - 1);
        });

        // col-floor(row)로 그룹화
        const groupedLockers = {};
        allLockersData.forEach(locker => {
          // key 생성 시 row 값도 정수형으로 처리하여 그룹화
          const key = `${locker.col}-${Math.floor(locker.row || 1)}`;
          if (!groupedLockers[key]) {
            groupedLockers[key] = [];
          }
          groupedLockers[key].push(locker);
        });

        // 각 col, row별 최대 너비와 높이 계산
        const colMaxContentWidths = Array(maxColIndex + 1).fill(0);
        const rowMaxContentHeights = Array(maxRowIndex + 1).fill(0);

        Object.keys(groupedLockers).forEach(key => {
          const group = groupedLockers[key];
          const [col, rowFloor] = key.split('-').map(Number); // key는 이미 정수화된 row
          
          const colIdx = col - 1;
          const rowIdx = rowFloor - 1; // 정수화된 row를 인덱스로 사용

          let groupTotalWidth = -padding;
          let maxHeightInGroup = 0;

          group.forEach(locker => {
            const lw = locker.width || $scope.lockerWidth;
            const lh = locker.height || $scope.lockerHeight;
            groupTotalWidth += lw + padding;
            maxHeightInGroup = Math.max(maxHeightInGroup, lh);
          });

          colMaxContentWidths[colIdx] = Math.max(colMaxContentWidths[colIdx], groupTotalWidth);
          // rowMaxContentHeights도 정수화된 row 인덱스에 저장
          rowMaxContentHeights[rowIdx] = Math.max(rowMaxContentHeights[rowIdx], maxHeightInGroup);
        });

        // col과 row 시작 위치 누적 계산
        const colPositions = [0];
        for (let i = 1; i <= maxColIndex; i++) {
          colPositions[i] = colPositions[i - 1] + colMaxContentWidths[i - 1] + padding;
        }

        const rowPositions = [0];
        for (let i = 1; i <= maxRowIndex; i++) {
          rowPositions[i] = rowPositions[i - 1] + rowMaxContentHeights[i - 1] + padding;
        }

        // 락커 위치 결정 (모든 row는 정수형으로 처리)
        Object.keys(groupedLockers).forEach(key => {
          const group = groupedLockers[key];
          const [col, rowFloor] = key.split('-').map(Number); // key는 이미 정수화된 row

          const colIdx = col - 1;
          const rowIdx = rowFloor - 1; // 정수화된 row를 인덱스로 사용

          group.sort((a, b) => a.serial - b.serial);

          let offsetX = 0; // 그룹내 가로 오프셋

          group.forEach(locker => {
            const lw = locker.width || $scope.lockerWidth;
            const lh = locker.height || $scope.lockerHeight;
            const label = locker.label || `${String.fromCharCode(65 + colIdx)}${rowFloor}`; // 라벨도 정수 row 사용

            const left = colPositions[colIdx] + offsetX;
            // top 위치는 정수화된 row의 시작 위치 그대로 사용
            const top = rowPositions[rowIdx] || 0;

            processedLockers.push({
              label: label,
              status: locker.status || "B",
              loc: { left, top },
              width: lw,
              height: lh,
              col: col, // 원래 col 값 저장
              row: rowFloor, // 원래 row 값 대신 정수화된 row 값 저장
              serial: locker.serial,
              jumper: locker.jumper
            });

            offsetX += lw + padding;
          });
        });

        $scope.lockers = processedLockers;

        // 컨테이너 크기 결정
        let maxRight = 0;
        let maxBottom = 0;
        processedLockers.forEach(locker => {
          maxRight = Math.max(maxRight, locker.loc.left + locker.width);
          maxBottom = Math.max(maxBottom, locker.loc.top + locker.height);
        });
        const gridPadding = 15;
        $scope.containerWidth = maxRight + gridPadding;
        $scope.containerHeight = maxBottom + gridPadding;
      })
      .catch(err => {
        console.error("락커 목록 불러오기 오류:", err);
      });
  };

  // 락커 선택 함수 예시
  $scope.selectLocker = function(locker) {
    alert(`락커 ${locker.label} 선택됨 (시리얼: ${locker.serial})`);
  };

  // 초기 실행
  $scope.loadLockers();
});