"use strict";

angular
  .module("inspinia")
  .controller(
    "AppleboxViewCtrl",
    function ($scope, $http, $stateParams, $uibModal, $q) {
      $scope.yid = $stateParams.yid;
      $scope.lockers = [];
      $scope.lockerWidth = 100;
      $scope.lockerHeight = 100;

      // -----------------------------
      // 라즈베리 상태 → DB 동기화 후 락커 로드
      // -----------------------------
      // $scope.loadLockers = function () {
      //   // 1️⃣ 라즈베리에서 실시간 상태 가져오기
      //   $http
      //     .get(`/v1/AppleboxAll/${$scope.yid}`)
      //     .then((res) => {
      //       const raspberryData = res.data.data?.cabinet || [];

      //       // 2️⃣ 라즈베리 데이터 → DB 상태 업데이트
      //       const updatePromises = [];
      //       raspberryData.forEach((cab) => {
      //         cab.box.forEach((box) => {
      //           updatePromises.push(
      //             $http.post(`/api/locker/updateStatus/${box.serial}`, {
      //               status: box.closed ? "A" : "B", // 예: 닫힘→A, 열림→B
      //             })
      //           );
      //         });
      //       });

      //       // 3️⃣ 모든 업데이트가 끝나면 DB에서 목록 다시 가져옴
      //       return $q.all(updatePromises);
      //     })
      //     .then(() => {
      //       return $http.get(`/api/locker/lockerCrud/${$scope.yid}`);
      //     })
      //     .then((res) => {
      //       // 4️⃣ DB 기준으로 화면 표시
      //       $scope.lockers = res.data;
      //       calculateLockerPositions($scope.lockers);
      //     })
      //     .catch((err) => {
      //       console.error("락커 불러오기 오류:", err);
      //       toastr.error("락커 정보를 불러오지 못했습니다.");
      //     });
      // };

      // -----------------------------
      // 초기 실행 (화면 테스트용)
      // -----------------------------
      const dummyLockers = [
        {
          col: 1,
          row: 1,
          width: 100,
          height: 100,
          serial: "001",
          label: "A1",
          status: "A",
        },
        {
          col: 2,
          row: 1,
          width: 100,
          height: 100,
          serial: "002",
          label: "B1",
          status: "B",
        },
        {
          col: 1,
          row: 2,
          width: 100,
          height: 100,
          serial: "003",
          label: "A2",
          status: "A",
        },
        {
          col: 2,
          row: 2,
          width: 100,
          height: 100,
          serial: "004",
          label: "B2",
          status: "B",
        },
      ];

      calculateLockerPositions(dummyLockers);

      // -----------------------------
      // 위치 계산 함수
      // -----------------------------
      function calculateLockerPositions(lockers) {
        const processedLockers = [];
        const padding = 10;

        // 1️⃣ 최대 col, row 계산 (row는 정수화)
        let maxColIndex = 0;
        let maxRowIndex = 0;
        lockers.forEach((locker) => {
          maxColIndex = Math.max(maxColIndex, (locker.col || 1) - 1);
          maxRowIndex = Math.max(maxRowIndex, Math.floor(locker.row || 1) - 1);
        });

        // 2️⃣ col-row 기준 그룹화
        const groupedLockers = {};
        lockers.forEach((locker) => {
          const rowFloor = Math.floor(locker.row || 1);
          const key = `${locker.col}-${rowFloor}`;
          if (!groupedLockers[key]) groupedLockers[key] = [];
          groupedLockers[key].push(locker);
        });

        // 3️⃣ 그룹별 최대 너비와 높이 계산
        const colWidths = Array(maxColIndex + 1).fill(0);
        const rowHeights = Array(maxRowIndex + 1).fill(0);

        Object.keys(groupedLockers).forEach((key) => {
          const group = groupedLockers[key];
          const [col, rowFloor] = key.split("-").map(Number);
          const colIdx = col - 1;
          const rowIdx = rowFloor - 1;

          let groupWidth = -padding;
          let maxHeight = 0;
          group.forEach((locker) => {
            const lw = locker.width || $scope.lockerWidth;
            const lh = locker.height || $scope.lockerHeight;
            groupWidth += lw + padding;
            maxHeight = Math.max(maxHeight, lh);
          });

          colWidths[colIdx] = Math.max(colWidths[colIdx], groupWidth);
          rowHeights[rowIdx] = Math.max(rowHeights[rowIdx], maxHeight);
        });

        // 4️⃣ 누적 위치 계산
        const colPositions = [0];
        const rowPositions = [0];
        for (let i = 1; i <= maxColIndex; i++)
          colPositions[i] = colPositions[i - 1] + colWidths[i - 1] + padding;
        for (let i = 1; i <= maxRowIndex; i++)
          rowPositions[i] = rowPositions[i - 1] + rowHeights[i - 1] + padding;

        // 5️⃣ 최종 락커 위치 결정
        Object.keys(groupedLockers).forEach((key) => {
          const group = groupedLockers[key];
          const [col, rowFloor] = key.split("-").map(Number);
          const colIdx = col - 1;
          const rowIdx = rowFloor - 1;

          group.sort((a, b) => a.serial - b.serial);

          let offsetX = 0;
          group.forEach((locker) => {
            const lw = locker.width || $scope.lockerWidth;
            const lh = locker.height || $scope.lockerHeight;
            const label =
              locker.label || `${String.fromCharCode(65 + colIdx)}${rowFloor}`;

            processedLockers.push({
              ...locker,
              label,
              loc: {
                left: colPositions[colIdx] + offsetX,
                top: rowPositions[rowIdx],
              },
              width: lw,
              height: lh,
              row: rowFloor,
            });

            offsetX += lw + padding;
          });
        });

        $scope.lockers = processedLockers;

        // 6️⃣ 컨테이너 크기 계산
        let maxRight = 0;
        let maxBottom = 0;
        processedLockers.forEach((locker) => {
          maxRight = Math.max(maxRight, locker.loc.left + locker.width);
          maxBottom = Math.max(maxBottom, locker.loc.top + locker.height);
        });
        const gridPadding = 15;
        $scope.containerWidth = maxRight + gridPadding;
        $scope.containerHeight = maxBottom + gridPadding;
      }

      // -----------------------------
      // 문 열기 모달
      // -----------------------------
      $scope.openLocker = function (locker) {
        const modalInstance = $uibModal.open({
          animation: true,
          template: `
      <div class="modal-header">
        <h4 class="modal-title">문 열기</h4>
      </div>
      <div class="modal-body">
        <p>락커 <strong>{{locker.label}}</strong>의 문을 여시겠습니까?</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" ng-click="confirm()">열기</button>
        <button class="btn btn-secondary" ng-click="cancel()">취소</button>
      </div>
    `,
          controller: function ($scope, $uibModalInstance, $http) {
            $scope.locker = locker;

            $scope.cancel = function () {
              $uibModalInstance.dismiss("cancel");
            };

            $scope.confirm = function () {
              // 1️⃣ DB 상태 변경 (예: 열림)
              $http
                .post(`/api/locker/lockerAction/take${locker.serial}`, {
                  status: "B",
                })
                .then(() => {
                  locker.status = "B";
                  // 2️⃣ 라즈베리 제어 신호 전송
                  return $http.post(`/v1/OpenLocker/${locker.serial}`, locker);
                })
                .then(() => {
                  toastr.success(`${locker.label} 문을 열었습니다.`);
                  $uibModalInstance.close();
                })
                .catch(() => {
                  toastr.error("문 열기에 실패했습니다.");
                });
            };
          },
          windowClass: "my-modal-center", // 모달 중앙 정렬용 클래스
          size: "sm", // 필요 시 'md', 'lg'로 조절 가능
        });
      };

      // -----------------------------
      // 초기 실행
      // -----------------------------
      // $scope.loadLockers();
    }
  );
