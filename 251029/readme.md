📘 8장: HTML DOM(Document Object Model)
🎯 학습 목표
- DOM의 필요성과 구조 이해
- DOM 객체를 통한 HTML 제어
- document 객체 및 메소드 활용
- DOM 객체 동적 생성 및 삭제
🧩 핵심 개념
1. DOM이란?
- HTML 태그마다 DOM 객체 생성
- HTML 구조를 트리 형태로 표현 (DOM 트리)
- DOM 객체를 통해 콘텐츠, 스타일, 이벤트 제어 가능
2. DOM 객체 구성 요소
- 프로퍼티: 태그 속성 반영
- 메소드: DOM 조작 함수
- 컬렉션: 자식 DOM 객체 집합
- 이벤트 리스너: 사용자 상호작용 처리
- CSS3 스타일: 스타일 시트 정보
3. DOM 객체 접근 및 제어
- getElementById(), getElementsByTagName(), getElementsByClassName() 등으로 DOM 객체 찾기
- innerHTML, style, onclick 등을 통해 콘텐츠 및 스타일 변경
4. document 객체
- HTML 문서 전체를 대표하는 객체
- DOM 트리의 루트
- 주요 프로퍼티: title, URL, domain, readyState 등
- 주요 메소드: write(), createElement(), appendChild(), removeChild()
5. 동적 문서 구성
- createElement()로 DOM 객체 생성
- appendChild()로 삽입, removeChild()로 삭제
- document.open()과 document.close()로 문서 초기화 및 종료

📗 9장: 이벤트 기초 및 활용
🎯 학습 목표
- 이벤트의 개념과 발생 시점 이해
- 다양한 이벤트 리스너 작성 방법 습득
- 이벤트 흐름과 객체 활용
- 마우스 및 키보드 이벤트 처리
🧩 핵심 개념
1. 이벤트란?
- 사용자 입력 또는 브라우저 상태 변화에 대한 통지
- 예: 클릭, 키 입력, 로딩 완료, 타임아웃 등
2. 이벤트 리스너 작성 방법
- HTML 태그 내 직접 작성
- DOM 객체의 이벤트 프로퍼티에 등록
- addEventListener() 메소드 활용
- 익명 함수 사용 가능
3. 이벤트 객체
- 이벤트 발생 시 전달되는 정보 객체
- 주요 프로퍼티: type, target, currentTarget, defaultPrevented
- 주요 메소드: preventDefault(), stopPropagation()
4. 이벤트 흐름
- 캡쳐 단계 → 타겟 → 버블 단계
- addEventListener()의 세 번째 인자로 흐름 제어 (true: 캡쳐, false: 버블)
5. 마우스 이벤트
- 다양한 이벤트: onclick, onmousedown, onmouseup, onwheel, onmousemove, oncontextmenu 등
- 마우스 좌표 정보: clientX, screenX, offsetX, x 등
6. 키보드 이벤트
- keydown, keyup 등 키 입력 처리
