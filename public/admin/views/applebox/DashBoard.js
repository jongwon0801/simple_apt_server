"use strict";

angular
  .module("inspinia")
  .controller("DashBoardCtrl", function ($scope, $http, $timeout, $rootScope) {
    // -----------------------------
    // 1️⃣ $scope.currentUser 세팅 (ng-if용)
    // -----------------------------
    $scope.currentUser = $rootScope.globals?.currentUser || null;

    // -----------------------------
    // 2️⃣ 색상 팔레트 & 차트 객체
    // -----------------------------
    const palette = [
      "#4e79a7",
      "#f28e2b",
      "#e15759",
      "#76b7b2",
      "#59a14f",
      "#edc948",
      "#b07aa1",
      "#ff9da7",
      "#9c755f",
      "#bab0ab",
    ];
    let ratioChart, yidChart, staffChart;

    // -----------------------------
    // 3️⃣ 차트 렌더링 함수
    // -----------------------------
    function renderRatio(r) {
      const ctx = document.getElementById("ratioChart").getContext("2d");
      if (ratioChart) ratioChart.destroy();
      ratioChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["보관", "수령"],
          datasets: [
            {
              data: [r.save || 0, r.take || 0],
              backgroundColor: [palette[0], palette[1]],
            },
          ],
        },
        options: {
          responsive: false,
          plugins: { legend: { position: "bottom" } },
        },
      });
    }

    function renderTopYid(list) {
      const labels = list.map(
        (i) => i.yid + (i.location ? " - " + i.location : "")
      );
      const data = list.map((i) => i.count);
      const ctx = document.getElementById("yidChart").getContext("2d");
      if (yidChart) yidChart.destroy();
      yidChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "사용 횟수",
              data,
              backgroundColor: palette.slice(0, labels.length),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    function renderTopStaff(list) {
      const labels = list.map((i) => i.hp);
      const data = list.map((i) => i.count);
      const ctx = document.getElementById("staffChart").getContext("2d");
      if (staffChart) staffChart.destroy();
      staffChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "이용 횟수",
              data,
              backgroundColor: palette.slice(0, labels.length),
            },
          ],
        },
        options: {
          responsive: true,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true } },
        },
      });
    }

    // -----------------------------
    // 4️⃣ 데이터 로드
    // -----------------------------
    function loadStats() {
      $http
        .get("/api/applebox/dashboardCrud/summaryStats")
        .then((res) => {
          $scope.summary = {
            boxCount: res.data.boxCount || "-",
            lockerCount: res.data.lockerCount || "-",
            saveThisMonth: res.data.saveThisMonth || "-",
            takeThisMonth: res.data.takeThisMonth || "-",
          };
        })
        .catch((err) => console.error("SummaryStats load error:", err));
    }

    function loadCharts() {
      $http
        .get("/api/applebox/dashboardCrud/summary")
        .then((res) => {
          const r = res.data;
          renderRatio(r.ratio);
          renderTopYid(r.topYid);
          renderTopStaff(r.topStaff);
        })
        .catch((err) => console.error("Dashboard summary load error:", err));
    }

    function loadAll() {
      loadStats();
      loadCharts();
    }

    // -----------------------------
    // 5️⃣ 최초 로드 + 1시간 갱신
    // -----------------------------
    $timeout(() => {
      loadAll();
      const intervalId = setInterval(loadAll, 60 * 60 * 1000);

      $scope.$on("$destroy", () => {
        clearInterval(intervalId);
        [ratioChart, yidChart, staffChart].forEach((ch) => ch && ch.destroy());
      });
    }, 100);
  });
