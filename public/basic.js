/**
 * 현재 시간과 타임스탬프의 차이 값을 기준으로 몇 일 전, 몇 시간 전인지 값을 반환한다.
 * @param {String} timestamp 타임스탬프
 * @returns {String} ex) 1시간 전, 1일 전
 */
export function func_diff_date(timestamp){
    const now = new Date();
    const date =  new Date(timestamp);

    // 현재 시간과 입력 받은 시간의 차이(ms 단위)
    const differenceInMillis = now - date;

    // 차이를 시간 단위로 변환
    const differenceInHours = differenceInMillis / (1000 * 60 * 60);

    // 차이를 일 단위로 변환
    const differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);

    if (Math.abs(differenceInDays) < 1) { 
        // 시간 단위로 반환
        return `${Math.floor(differenceInHours)}시간 전`;
    } else { 
        // 일 단위로 반환
        return `${Math.floor(differenceInDays)}일 전`;
    }

}