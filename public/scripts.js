import * as basic from "./basic.js"

$(function () {
    const account_get_puuid = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/`;
    const account_get_summoner = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/`;
    const account_get_league = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/`;
    const account_get_champion = `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/`;
    const account_get_matchesID = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/`;
    const get_match_info = `https://asia.api.riotgames.com/lol/match/v5/matches/`;
    
    const queueId_arr = [490, 400, 430, 420, 440, 450];
    const queueId_name_map = new Map([
        [490, "일반"],
        [400, "일반"],
        [430, "일반"],
        [420, "솔로 랭크"],
        [440, "자유 랭크"],
        [450, "무작위 총력전"],
      ]);

    let api_key;

    let api_key_xmlhttp = new XMLHttpRequest();
    let url = "api_key.json";

    api_key_xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let api_key_json = JSON.parse(api_key_xmlhttp.responseText);
            api_key = api_key_json.api_key;
        }
    };
    api_key_xmlhttp.open("GET", url, true);
    api_key_xmlhttp.send();

    /* 챔피언 json data */
    let champion_json_url = `https://ddragon.leagueoflegends.com/cdn/14.14.1/data/ko_KR/champion.json`;
    let champion_data_map = new Map();
    let champion_xmlhttp = new XMLHttpRequest();
    champion_xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(champion_xmlhttp.responseText);
            for (const champName in json.data) {
                if (json.data.hasOwnProperty(champName)) {
                    const champ = json.data[champName];
                    champion_data_map.set(Number(champ.key), {id: champ.id, name: champ.name});
                }
            }
        }
    };

    champion_xmlhttp.open("GET", champion_json_url, true);
    champion_xmlhttp.send();
    /* 챔피언 json data */

    /* 스펠 json data */
    let spell_json_url = `https://ddragon.leagueoflegends.com/cdn/14.14.1/data/ko_KR/summoner.json`;
    let spell_data_map = new Map();
    let spell_xmlhttp = new XMLHttpRequest();
    spell_xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(spell_xmlhttp.responseText);
            for (const spellName in json.data) {
                if (json.data.hasOwnProperty(spellName)) {
                    const spell = json.data[spellName];
                    spell_data_map.set(Number(spell.key), {id: spell.id, name: spell.name, description : spell.description});
                }
            }
        }
    };

    spell_xmlhttp.open("GET", spell_json_url, true);
    spell_xmlhttp.send();
    /* 스펠 json data */

    /* 룬 json data */
    let rune_json_url = `https://ddragon.leagueoflegends.com/cdn/14.14.1/data/ko_KR/runesReforged.json`;
    let rune_data_map = new Map();
    let rune_xmlhttp = new XMLHttpRequest();
    rune_xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(rune_xmlhttp.responseText);
            for (const r in json) {
                if (json.hasOwnProperty(r)) {
                    const rune = json[r];
                    rune_data_map.set(Number(rune.id), {id: rune.id, icon: rune.icon, name : rune.name, runes : rune.slots[0].runes});
                }
            }
        }
    };

    rune_xmlhttp.open("GET", rune_json_url, true);
    rune_xmlhttp.send();
    /* 룬 json data */

    /* 아이템 json data */
    let item_json_url = `https://ddragon.leagueoflegends.com/cdn/14.14.1/data/ko_KR/item.json`;
    let item_data_map = new Map();
    let item_xmlhttp = new XMLHttpRequest();
    item_xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let json = JSON.parse(item_xmlhttp.responseText).data;
            for (const i in json) {
                if (json.hasOwnProperty(i)) {
                    const item = json[i];
                    item_data_map.set(Number(i), {name : item.name, description : item.description, plaintext : item.plaintext, image : item.image.full});
                }
            }
        }
    };

    item_xmlhttp.open("GET", item_json_url, true);
    item_xmlhttp.send();
    /* 아이템 json data */

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
            let nickName = $('#nickName').val();
            createUserCard();

            // '닉네임#태그'인 경우 프로필 생성
            const regex = /^.*#.*$/;

            if(regex.test(nickName)){
                $('#userId').val(nickName);
                createProfileCard();
            };
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

    $('#userId').on("keyup", function (key) {
        if (key.keyCode == 13) {
            createProfileCard();
        }
    })

    $('#search_btn').on("click", function () {
        createProfileCard();
    })

    $(document).on("click", ".userInfo_drop_btn", function () {
        $(this).closest('.userInfo-container').remove();
    })

    function createProfileCard(){
        let user_id = $('#userId').val();

        let gameName = user_id.split("#")[0];
        let tagLine = user_id.split("#")[1];

        let url_get_puuid = `/get_puuid/${gameName}/${tagLine}/${api_key}`;

        // 포지션 map
        let position_cnt_map = new Map([
            ["TOP", 0],
            ["JUNGLE", 0],
            ["MIDDLE", 0],
            ["BOTTOM", 0],
            ["UTILITY", 0],
            ["UNKNOWN", 0]
        ]);

        fetch(url_get_puuid)
        .then(res => res.json())
        .then(data => func_puuid(data));

        function func_puuid(data){
            let puuid_data = data.puuid;

            if(puuid_data){
                let profile = `<div class="userInfo-container">
                                    <div style='display: flex; flex-direction: row-reverse;'>
                                        <span style='display: none'>${puuid_data}</span>
                                        <span class='userInfo_drop_btn'>X</span>
                                    </div>
                                    <div style='display: flex;'>
                                        <div class='profile_icon'></div>    
                                        <div style='display: flex; flex-direction: column;'>
                                            <div style='padding: 5px 5px 0px 5px;'>
                                                <span class='profile_gameName'>${gameName}</span>
                                                <span class='profile_tagLine'>#${tagLine}</span>
                                            </div>
                                            <div style='padding: 5px 5px 0px 8px;'>
                                                <span class='profile_level'>레벨 : <span class='profile_level_tag'></span></span>
                                            </div>
                                            <div style='padding: 5px 5px 0px 8px; font-size: 12px; display: flex; flex-direction: column;'>
                                                <span class='solo_rank'><span style='width: 150px; display: inline-block;'>솔로 : <span class='tier_solo'></span></span> <span class='cnt_solo'></span>전 승 : <span class='wins_solo'></span> / 패 : <span class='losses_solo'></span> (<span class='rate_solo'></span>%)</span>
                                                <span class='free_rank'><span style='width: 150px; display: inline-block;'>자유 : <span class='tier_free'></span></span> <span class='cnt_free'></span>전 승 : <span class='wins_free'></span> / 패 : <span class='losses_free'></span> (<span class='rate_free'></span>%)</span>
                                            </div>
                                        </div>
                                        <div class='ranked_emblem_div'></div>    
                                        <div class='positionChart'>
                                            <canvas id='chart'></canvas>
                                        </div>
                                    </div>
                                    <div style='display: flex; flex-direction: column;'>
                                        <span style='font-size:14px; margin:5px;'>숙련도</span>
                                        <div class='top_champion'></div>
                                    </div>
                                    <div style='display: flex; flex-direction: column;'>
                                        <span style='font-size:14px; margin:5px;'>최근 전적</span>
                                        <div class='match_info'></div>
                                    </div>
                                    
                                </div>`;

                let newProfile = $(profile).appendTo('#search-container');

                // 소환사 정보 조회
                let url_get_summoner = account_get_summoner + puuid_data + "?api_key=" + api_key;
                fetch(url_get_summoner)
                .then(res => res.json())
                .then(data => func_summoner(data, newProfile));

                // 챔피언 숙련도 조회
                let url_get_champion = account_get_champion + puuid_data + "?api_key=" + api_key;
                fetch(url_get_champion)
                .then(res => res.json())
                .then(data => func_champion(data, newProfile));

                // 최근 전적 20개 매치 아이디 조회
                let url_get_matchesID = `/get_matchesID/${puuid_data}/${api_key}`;
                fetch(url_get_matchesID)
                .then(res => res.json())
                .then(data => func_matches(data, newProfile, puuid_data));

            }else{
                alert("해당 이름의 소환사를 찾을 수 없습니다.\n정확한 태그명(#????)과 함께 검색해 주세요.");
            }
            
        }

        function func_summoner(data, newProfile){
            let summoner_data = data;
            let profile_icon = `<img style='width: 100px;' src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/profileicon/${summoner_data.profileIconId}.png'>`;
            newProfile.find('.profile_icon').append(profile_icon);
            newProfile.find('.profile_level').append(summoner_data.summonerLevel);

            let url_get_league = account_get_league + summoner_data.id + "?api_key=" + api_key;

            fetch(url_get_league)
            .then(res => res.json())
            .then(data => {
                let tier_solo = '';
                let wins_solo = 0;
                let losses_solo = 0;
                let cnt_solo = 0;
                let rate_solo = 0;
                let ranked_solo = '';
                let tier_free = '';
                let wins_free = 0;
                let losses_free = 0;
                let cnt_free = 0;
                let rate_free = 0;
                let ranked_free = '';
                let emblem_img = '';

                data.forEach(d => {
                    if(d.queueType === 'RANKED_SOLO_5x5'){
                        tier_solo = d.tier + ' ' + d.rank;
                        wins_solo = d.wins;
                        losses_solo = d.losses;
                        cnt_solo = wins_solo + losses_solo;
                        rate_solo = (wins_solo / cnt_solo * 100).toFixed(1);
                        ranked_solo = d.tier;
                    }else if(d.queueType === 'RANKED_FLEX_SR'){
                        tier_free = d.tier + ' ' + d.rank;
                        wins_free = d.wins;
                        losses_free = d.losses;
                        cnt_free = wins_free + losses_free;
                        rate_free = (wins_free / cnt_free * 100).toFixed(1);
                        ranked_free = d.tier;
                    }
                });

                if(ranked_solo){
                    emblem_img = `<img style='width: 100%; height: 100%; object-fit: cover;' src='/img/ranked-emblem/emblem-${ranked_solo}.png'>`;
                }else{
                    if(ranked_free){
                        emblem_img = `<img style='width: 100%; height: 100%; object-fit: cover;' src='/img/ranked-emblem/emblem-${ranked_free}.png'>`;
                    }
                }

                newProfile.find('.tier_solo').append(tier_solo);
                newProfile.find('.wins_solo').append(wins_solo);
                newProfile.find('.losses_solo').append(losses_solo);
                newProfile.find('.cnt_solo').append(cnt_solo);
                newProfile.find('.rate_solo').append(rate_solo);

                newProfile.find('.tier_free').append(tier_free);
                newProfile.find('.wins_free').append(wins_free);
                newProfile.find('.losses_free').append(losses_free);
                newProfile.find('.cnt_free').append(cnt_free);
                newProfile.find('.rate_free').append(rate_free);

                newProfile.find('.ranked_emblem_div').append(emblem_img);
                
            });
        }

        function func_champion(data, newProfile){
            let top_champion = ``;
            for(let i in data){
                if(i > 20) break;
                let champ_id = data[i].championId;
                let champ_level = data[i].championLevel;
                let champion = champion_data_map.get(champ_id);

                top_champion += `<div>
                                    <div><img style='width: 60px;' src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${champion.id}.png'></div>
                                    <div style='display:flex; font-size:12px; flex-direction: column;'>
                                        <div style='margin: 0 auto;'>`;
                
                let champ_img = ``;
                if(champ_level < 10){
                    champ_img = `<img style='width: 33px;' src='/img/mastery-${champ_level}.png'>`;
                }else{
                    champ_img = `<img style='width: 33px;' src='/img/mastery-10.png'><div style='text-align: center;'><span class='champ_level_tag'>${champ_level}</span></div>`;
                }

                top_champion += `${champ_img}</div>
                                    </div>
                                </div>`;
            }

            newProfile.find('.top_champion').append(top_champion);
        }

        async function func_matches(data, newProfile, puuid_data){
            for (const matchID of data) {
                // 매치 정보 조회
                let url_get_matchesID = `/get_matchInfo/${matchID}/${api_key}`;
        
                try {
                    const res = await fetch(url_get_matchesID);
                    const matchData = await res.json();
                    if(newProfile.find('.match_info_div').length > 9) {
                        func_position_setting(position_cnt_map, newProfile);
                        break;
                    }
                    func_matchInfo(matchData, newProfile, puuid_data);
                } catch (error) {
                    console.error(`Error fetching match data for matchID ${matchID}:`, error);
                }
            }
        }

        function func_matchInfo(data, newProfile, puuid_data){
            console.log(data);
            let gameStartTimestamp = data.info.gameStartTimestamp; // 게임 시작 시간 타임스탬프
            let gameDuration = Math.floor(data.info.gameDuration / 60 ); // 게임 진행 시간 분
            let gameDuration_seconds = data.info.gameDuration % 60; // 게임 진행 시간 초
            let queueId = data.info.queueId; // 큐 타입 (일반, 솔로 랭크, 자유 랭크, 무작위 총력전)
            let participants = data.info.participants; // 참가자 정보
            let teams_info = data.info.teams; // 팀 정보
            let teams_map = new Map();
            for (const t in teams_info) {
                if (teams_info.hasOwnProperty(t)) {
                    const team = teams_info[t];
                    teams_map.set(Number(team.teamId), 
                    {
                        win: team.win, 
                        bans: team.bans,
                        baron: team.objectives.baron, // 바론
                        champion: team.objectives.champion, // 챔피언
                        dragon: team.objectives.dragon, // 드래곤
                        horde: team.objectives.horde, // 유충
                        inhibitor: team.objectives.inhibitor,
                        riftHerald: team.objectives.riftHerald, // 전령
                        tower: team.objectives.tower,
                    });
                }
            }

            let match_info = ``;
            participants.forEach(data => {
                if(data.puuid === puuid_data && queueId_arr.includes(queueId)){
                    console.log("champExperience = " + data.champExperience);
                    console.log("goldEarned = " + data.goldEarned);
                    let teamId = data.teamId; // 팀 id
                    let teamPosition = data.teamPosition || 'UNKNOWN' // 포지션
                    let summoner1 = spell_data_map.get(data.summoner1Id); // 스펠1 (id, name, description)
                    let summoner2 = spell_data_map.get(data.summoner2Id); // 스펠2 (id, name, description)
                    let kills = data.kills; // 킬
                    let assists = data.assists; // 어시스트
                    let deaths = data.deaths; // 데스
                    let kda = ''; // kda
                    if(deaths == 0){
                        kda = 'Perfect';
                    }else{
                        kda = ((kills + assists)/deaths).toFixed(2) + ' : 1';
                    }

                    let team_info = teams_map.get(teamId);
                    let team_kills = team_info.champion.kills;
                    let team_rate = ''; // 킬 관여율
                    if(team_kills == 0){
                        team_rate = '0%'
                    }else{
                        team_rate = ((kills + assists) / team_kills * 100).toFixed(0) + '%';
                    }

                    let position_cnt = position_cnt_map.get(teamPosition) || 0;
                    position_cnt++;
                    position_cnt_map.set(teamPosition, position_cnt);

                    console.log("totalDamageDealtToChampions = " + data.totalDamageDealtToChampions);
                    console.log("totalDamageTaken = " + data.totalDamageTaken);
                    let rune = data.perks.styles; // 룬 정보
                    let primary_rune; // 핵심 룬
                    let primary_rune_top; // 핵심 룬
                    let sub_rune; // 보조 룬
                    rune.forEach(data => {
                        if(data.description === 'primaryStyle'){
                            primary_rune = data.style;
                            primary_rune_top = data.selections[0].perk;
                        }else{
                            sub_rune = data.style;
                        }
                    })

                    let primary_rune_top_img = '';
                    let primary_rune_top_data_runes = rune_data_map.get(primary_rune).runes;

                    primary_rune_top_data_runes.forEach(data => {
                        if(data.id === primary_rune_top){
                            primary_rune_top_img = data.icon;
                        }
                    });

                    let item0 = data.item0 != 0 ? item_data_map.get(data.item0) : '';
                    let item1 = data.item1 != 0 ? item_data_map.get(data.item1) : '';
                    let item2 = data.item2 != 0 ? item_data_map.get(data.item2) : '';
                    let item3 = data.item3 != 0 ? item_data_map.get(data.item3) : '';
                    let item4 = data.item4 != 0 ? item_data_map.get(data.item4) : '';
                    let item5 = data.item5 != 0 ? item_data_map.get(data.item5) : '';
                    let item6 = data.item6 != 0 ? item_data_map.get(data.item6) : '';

                    let item_content = `<div style='display: flex;'>
                                            <div class='img22 img_border'>`;
                    if(item0){
                        item_content += `       <img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/item/${item0.image}'></img>
                                            </div>`;
                    }else{
                        item_content += `   </div>`;
                    }

                    if(item1){
                        item_content += `   <div class='img22 img_border'>
                                                <img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/item/${item1.image}'></img>
                                            </div>`;
                    }else{
                        item_content += `<div class='img22 img_border'></div>`;
                    }

                    if(item2){
                        item_content += `   <div class='img22 img_border'>
                                                <img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/item/${item2.image}'></img>
                                            </div>`;
                    }else{
                        item_content += `   <div class='img22 img_border'></div>`;
                    }

                    if(item6){
                        item_content += `   <div class='img22 img_border'>
                                                <img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/item/${item6.image}'></img>
                                            </div></div>
                                        <div style='display: flex;'>`;
                    }else{
                        item_content += `   <div class='img22 img_border'></div></div>
                                        <div style='display: flex;'>`;
                    }
                    
                    if(item3){
                        item_content += `   <div class='img22 img_border'>
                                               <img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/item/${item3.image}'></img>
                                            </div>`;
                    }else{
                        item_content += `   <div class='img22 img_border'></div>`;
                    }

                    if(item4){
                        item_content += `   <div class='img22 img_border'>
                                                <img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/item/${item4.image}'></img>
                                            </div>`;
                    }else{
                        item_content += `   <div class='img22 img_border'></div>`;
                    }

                    if(item5){
                        item_content += `   <div class='img22 img_border'>
                                                <img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/item/${item5.image}'></img>
                                            </div>`;
                    }else{
                        item_content += `<div class='img22 img_border'></div></div>`;
                    }
                    
                    /* 매치 결과 */
                    let match_result = [];
                    if(gameDuration <= 3){ // 게임시간이 3분 이하인 경우 다시하기
                        match_result[0] = 're_match';
                        match_result[1] = '다시하기';
                    }else{
                        if(data.win){
                            match_result[0] = 'win_match';
                            match_result[1] = '승리';
                        }else{
                            match_result[0] = 'defeated_match';
                            match_result[1] = '패배';
                        }
                    }

                    match_info += `<div class='match_info_div ${match_result[0]}'>
                                        <div style='display: flex; flex-direction: column; width: 140px; justify-content: center;'>
                                            <div class='match_info_result_div'>
                                                <div><span>${match_result[1]}</span></div>
                                                <div style='margin-left: auto;'><span>${gameDuration}분 ${gameDuration_seconds}초</span></div>
                                            </div>
                                            <div class='match_info_type_div'>
                                                <div><span>${queueId_name_map.get(queueId)}</span></div>
                                                <div style='margin-left: auto;'><span>${basic.func_diff_date(gameStartTimestamp)}</span></div>
                                            </div>
                                        </div>`;

                    match_info +=       `<div class='champImgDiv'>
                                            <div class='champImg'>    
                                                <img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${data.championName}.png'>
                                            </div>    
                                            <span class='match_info_champLevel'>${data.champLevel}</span>
                                        </div>
                                        <div class='match_info_spell_rune_img'>
                                            <div class='img22'><img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/spell/${summoner1.id}.png'></div>
                                            <div class='img22'><img src='https://ddragon.leagueoflegends.com/cdn/14.14.1/img/spell/${summoner2.id}.png'></div>
                                        </div>
                                        <div class='match_info_spell_rune_img'>
                                            <div class='img22'><img src='/img/${primary_rune_top_img}'></div>
                                            <div class='img22'><img src='/img/${rune_data_map.get(sub_rune).icon}'></div>
                                        </div>
                                        <div class='match_info_kda_div'>
                                            <div><span>${kills} / <span class='deaths_span'>${deaths}</span> / ${assists}</span></div>
                                            <div><span>${kda}</span></div>
                                            <div><span>킬관여 ${team_rate}</span></div>
                                        </div>
                                        <div class='match_info_item_div'>
                                            ${item_content}
                                        </div>
                                    </div>`;
                }
            });
            console.log("=================================================");
            
            newProfile.find('.match_info').append(match_info);
        }

        function func_position_setting(position_cnt_map, newProfile){
            let labels = [];
            let data = [];
            let maxValue = 0;

            position_cnt_map.forEach((value, key) => {
                if (key !== "UNKNOWN") {
                    if(key === 'TOP') labels.push('탑');
                    else if(key === 'JUNGLE') labels.push('정글');
                    else if(key === 'MIDDLE') labels.push('미드');
                    else if(key === 'BOTTOM') labels.push('원딜');
                    else if(key === 'UTILITY') labels.push('서폿');

                    data.push(value);
                    if (value > maxValue) {
                        maxValue = value;
                    }
                }
            });

            const normalizedData = data.map(value => (value / maxValue) * 10);

            const ctx = newProfile.find('.positionChart').find('#chart')[0].getContext('2d');
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Position Counts',
                        data: normalizedData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        pointBackgroundColor: 'rgba(54, 162, 235, 1)'
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false // 범례 숨기기
                        },
                        tooltip: {
                            enabled: false // 툴팁 숨기기
                        }
                    },
                    scales: {
                        r: {
                            angleLines: {
                                display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 10,
                            ticks: {
                                display: false // 눈금 라벨 숨기기
                            },
                        }
                    },
                    elements: {
                        point: {
                            radius: 0 // 포인트를 보이지 않게 설정
                        }
                    }
                }
            });
        }

    }

})