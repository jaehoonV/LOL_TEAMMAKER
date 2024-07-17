$(function () {
    if (localStorage.getItem('user')) {
        let userArray = JSON.parse(localStorage.getItem('user'));
        userArray.forEach(user => {
            let card = `<div class="userCard">
                            <input type="text" class="nickNameClass" value="${user.nickName}" disabled>
                            <input type="number" class="scoreClass" value="${user.score}" placeholder="점수">
                            <span class="deleteCard">X</span>
                        </div>`;
            $('#user-container').append(card);
        });
    }
    
    $('#nickName').on("keyup", function (key) {
        if (key.keyCode == 13) {
            $('#score').focus();
        }
    })

    $('#score').on("keyup", function (key) {
        if (key.keyCode == 13) {
            createUserCard();
        }
    })

    function createUserCard() {
        let nickName = $('#nickName').val();
        let score = $('#score').val();

        let card = `<div class="userCard">
                        <input type="text" class="nickNameClass" value="${nickName}" disabled>
                        <input type="number" class="scoreClass bot_shadow" value="${score}" placeholder="점수">
                        <span class="deleteCard">X</span>
                    </div>`;
        $('#user-container').append(card);
        $('#nickName').val('');
        $('#score').val('1');
        $('#nickName').focus();
    }

    $(document).on("click", ".deleteCard", function () {
        $(this).closest('.userCard').remove();
    })

    $('#enter_btn').on("click", function () {
        let user = [];
        $('.userCard').each(function (index, item) {
            let nickName = $(item).find('.nickNameClass').val();
            let score = $(item).find('.scoreClass').val();
            user.push({ nickName: nickName, score: parseInt(score) });
        });

        localStorage.setItem("user", JSON.stringify(user));

        // 짝수 체크
        if (user.length % 2 !== 0) {
            alert('유저의 수는 짝수여야 합니다.');
            return;
        }

        // 점수 내림차순
        user.sort((a, b) => b.score - a.score);

        // 모든 가능한 팀 조합을 생성
        let allTeamCombinations = generateAllTeamCombinations(user);

        // 점수 차이가 작은 상위 10개의 팀 조합 가져오기
        let top5Teams = findTop10Teams(allTeamCombinations);

        // 랜덤으로 한 팀 조합 선택
        let selectedTeam = selectRandomTeam(top5Teams);

        // 결과 출력
        displayTeam(selectedTeam);
    });

    // 모든 가능한 팀 조합 생성 함수
    function generateAllTeamCombinations(users) {
        let allCombinations = [];

        // 모든 조합 생성
        function generateCombinations(index, teamA, teamB) {
            if (index >= users.length) {
                if (teamA.length === teamB.length) {
                    allCombinations.push({ teamA: teamA.slice(), teamB: teamB.slice() });
                }
                return;
            }

            // 팀 A에 추가
            teamA.push(users[index]);
            generateCombinations(index + 1, teamA, teamB);
            teamA.pop();

            // 팀 B에 추가
            teamB.push(users[index]);
            generateCombinations(index + 1, teamA, teamB);
            teamB.pop();
        }

        generateCombinations(0, [], []);
        return allCombinations;
    }

    // 점수 차이가 작은 상위 10개의 팀 조합 찾기 함수
    function findTop10Teams(allCombinations) {
        let sortedCombinations = allCombinations.sort((a, b) => {
            let teamAScore = a.teamA.reduce((total, user) => total + user.score, 0);
            let teamBScore = a.teamB.reduce((total, user) => total + user.score, 0);
            let differenceA = Math.abs(teamAScore - teamBScore);

            teamAScore = b.teamA.reduce((total, user) => total + user.score, 0);
            teamBScore = b.teamB.reduce((total, user) => total + user.score, 0);
            let differenceB = Math.abs(teamAScore - teamBScore);

            return differenceA - differenceB;
        });

        return sortedCombinations.slice(0, 10);
    }

    // 랜덤으로 하나의 팀 조합 선택 함수
    function selectRandomTeam(top5Teams) {
        let randomIndex = Math.floor(Math.random() * top5Teams.length);
        return top5Teams[randomIndex];
    }

    function displayTeam(selectedTeam) {
        $('#a_container').empty();
        $('#b_container').empty();

        $('#a_container').append('<div class="teamName"> A TEAM </div>');
        $('#b_container').append('<div class="teamName"> B TEAM </div>');

        let teamA = selectedTeam.teamA;
        let teamB = selectedTeam.teamB;

        let teamAScore = teamA.reduce((total, user) => total + user.score, 0);
        let teamBScore = teamB.reduce((total, user) => total + user.score, 0);

        teamA.forEach(user => {
            let card = `<div class="teamCard">
                            <input type="text" class="nickNameClass" value="${user.nickName}" disabled>
                            <input type="number" class="scoreClass" value="${user.score}" disabled>
                        </div>`;
            $('#a_container').append(card);
        });

        teamB.forEach(user => {
            let card = `<div class="teamCard">
                            <input type="text" class="nickNameClass" value="${user.nickName}" disabled>
                            <input type="number" class="scoreClass" value="${user.score}" disabled>
                        </div>`;
            $('#b_container').append(card);
        });

        $('#a_container').append(`<div class="teamName"> Team A - Total Score: ${teamAScore} </div>`);
        $('#b_container').append(`<div class="teamName"> Team B - Total Score: ${teamBScore} </div>`);
    }

})
