📗 9장: 이벤트 기초 및 활용 🎯 학습 목표

이벤트의 개념과 발생 시점 이해
다양한 이벤트 리스너 작성 방법 습득
이벤트 흐름과 객체 활용
마우스 및 키보드 이벤트 처리 🧩 핵심 개념
이벤트란?
사용자 입력 또는 브라우저 상태 변화에 대한 통지
예: 클릭, 키 입력, 로딩 완료, 타임아웃 등
이벤트 리스너 작성 방법
HTML 태그 내 직접 작성
DOM 객체의 이벤트 프로퍼티에 등록
addEventListener() 메소드 활용
익명 함수 사용 가능
이벤트 객체
이벤트 발생 시 전달되는 정보 객체
주요 프로퍼티: type, target, currentTarget, defaultPrevented
주요 메소드: preventDefault(), stopPropagation()
이벤트 흐름
캡쳐 단계 → 타겟 → 버블 단계
addEventListener()의 세 번째 인자로 흐름 제어 (true: 캡쳐, false: 버블)
마우스 이벤트
다양한 이벤트: onclick, onmousedown, onmouseup, onwheel, onmousemove, oncontextmenu 등
마우스 좌표 정보: clientX, screenX, offsetX, x 등
키보드 이벤트
keydown, keyup 등 키 입력 처리
