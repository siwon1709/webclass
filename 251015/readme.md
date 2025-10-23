[8장. HTML DOM과 Document]

1. HTML DOM 개요
• 정의: DOM은 웹 페이지의 HTML 태그들을 각각 DOM 객체로 만드는 모델입니다.
목적: 자바스크립트가 이 DOM 객체들을 제어하여 HTML 태그의 콘텐츠나 CSS 스타일을 동적으로 변경하기 위해 사용됩니다 .
DOM 트리: HTML 태그들의 포함 관계(부모-자식)에 따라 DOM 객체들이 트리(tree)구조로 생성됩니다. 이 트리의 최상위 루트는 document객체입니다.
2. DOM 객체의 구조HTML 태그는 태그 이름, 속성(attribute), CSS 스타일, 이벤트 리스너, 콘텐츠(innerHTML)로 구성됩니다 . DOM 객체는 이를 반영하여 5가지 요소를 가집니다.
• 프로퍼티 (Property): HTML 태그의 속성을 반영합니다. (예: id, tagName, innerHTML) . 또한 parentElement, nextElementSibling등 DOM 트리 상의 관계를 나타내는 프로퍼티도 포함합니다.
메소드 (Method): DOM 객체를 제어하는 함수입니다. (예: setAttribute()).
컬렉션 (Collection): children과 같이 자식 DOM 객체들의 목록을 담는 배열과 유사한 집합입니다.
이벤트 리스너 (Event Listener): onclick등 HTML에 작성된 이벤트 리스너를 반영합니다.
CSS3 스타일: style프로퍼티를 통해 태그의 CSS 스타일 정보에 접근하고 제어할 수 있습니다 .
3. DOM 객체 다루기
• DOM 객체 찾기:
• document.getElementById("id"): 태그의 id속성을 이용해 특정 DOM 객체 하나를 찾습니다.
CSS 스타일 변경:
• style프로퍼티를 사용합니다.
CSS 속성 이름에 하이픈(-)이 있으면 카멜 케이스(camelCase)로 변경해야 합니다 (예: background-color는 backgroundColor로, font-size는 fontSize로 사용).
콘텐츠 변경 (innerHTML):
• innerHTML프로퍼티는 태그의 시작과 끝 태그 사이의 HTML 콘텐츠를 의미합니다.
이 프로퍼티의 값을 변경하면 브라우저 화면의 내용이 즉시 변경됩니다.
this키워드:
• 이벤트 리스너 코드 내에서 this는 이벤트가 발생한 DOM 객체 자신을 가리킵니다.
4. document객체
• 정의: HTML 문서 전체를 대변하는 객체이며 , DOM 트리의 최상위 객체입니다. DOM 객체를 찾기 위한 시작점 역할을 합니다.
DOM 객체 찾기 (복수):
• document.getElementsByTagName("태그이름"): 지정된 태그 이름의 모든 DOM 객체를 컬렉션(배열과 유사)으로 반환합니다.
document.getElementsByClassName("클래스이름"): 지정된 class 속성을 가진 모든 DOM 객체를 컬렉션으로 반환합니다.
document.write():
• 페이지가 로드되는 중에사용되면, document객체에 HTML 콘텐츠를 추가합니다.
(주의)페이지 로딩이 완료된 후(예: 버튼 클릭 시) document.write()를 호출하면, 현재 문서를 모두 지우고새로운 내용을 덮어씁니다.
document.open()close():
• document.open(): 현재 문서를 지우고 새롭게 DOM 트리를 구성할 준비를 합니다.
document.close(): 문서 작성을 완료합니다. 주로 새 창(popup)에 동적으로 HTML을 쓸 때 사용합니다 .
5. 문서의 동적 구성자바스크립트로 DOM 객체를 직접 생성하고 DOM 트리에 추가하거나 삭제할 수 있습니다.
• 생성: document.createElement("태그이름")메소드는 지정된 태그의 DOM 객체를 메모리에 생성합니다.
삽입: 부모객체.appendChild(자식객체)메소드를 사용해 생성된 DOM 객체를 부모 객체의 마지막 자식으로 DOM 트리에 추가합니다.
삭제: 부모객체.removeChild(자식객체)메소드를 사용해 DOM 트리에서 특정 자식 객체를 제거합니다.
========================================================================================================

[9장. 이벤트 기초 및 활용]

1. 이벤트 개요
• 이벤트(Event): 마우스 클릭, 키보드 입력, 이미지 로딩 완료 등 사용자의 행위나 브라우저의 상태 변화를 자바스크립트 코드에게 알리는 **통지(notification)**입니다

이벤트 리스너(Event Listener): 이벤트가 발생했을 때 이를 처리하기 위해 작성된 자바스크립트 코드(함수)입니다. (예: onclick, onmouseover) .

** 이벤트 리스너 작성 방법이벤트 리스너를 등록하는 방법은 크게 3가지가 있습니다.
   
1. HTML 태그 내 작성: <p onmouseover="this.style.color='red'">처럼 HTML 태그의 속성으로 직접 코드를 작성합니다.
DOM 객체 프로퍼티: p.onmouseover = changeColor;처럼 DOM 객체의 이벤트 리스너 프로퍼티에 함수를 대입합니다.
addEventListener()메소드: p.addEventListener("mouseover", changeColor);와 같이 표준 메소드를 사용해 등록합니다.
• 익명 함수(Anonymous Function): 함수 이름 없이 코드 블록을 바로 리스너로 등록하는 방식으로, 코드가 짧거나 한 곳에서만 사용할 때 편리합니다.
3. 이벤트 객체 (Event Object)
• 정의: 이벤트가 발생하면, 해당 이벤트에 대한 상세 정보(마우스 좌표, 눌린 키 값 등)를 담은 이벤트 객체가 생성됩니다 .
전달: 이 객체는 이벤트 리스너 함수의 첫 번째 매개변수로 자동 전달됩니다 (보통 e또는 event로 받음).
주요 프로퍼티:
• type: 이벤트의 종류 (예: "click").
target: 이벤트가 최초로 발생한객체.
currentTarget: 현재 리스너가 실행되고 있는객체.
이벤트의 디폴트 행동 취소:
• <a>태그 클릭(페이지 이동) 이나 <form>의 submit 버튼 클릭(폼 전송) 등은 HTML 태그의 기본 동작(디폴트 행동)입니다.
리스너 함수에서 return false;를 하거나 이벤트 객체의 event.preventDefault();메소드를 호출하면 이 기본 동작을 막을 수 있습니다.
4. 이벤트 흐름 (Event Flow)이벤트는 발생한 지점(target)에서만 실행되는 것이 아니라, DOM 트리를 따라 흐릅니다.
• 1. 캡쳐 단계 (Capturing Phase): 이벤트가 window객체에서 시작해 DOM 트리를 타고 아래로내려가 이벤트 타겟까지 도달하는 과정입니다.
2. 버블 단계 (Bubbling Phase): 이벤트가 타겟에서 다시 DOM 트리를 타고 위로올라가 window객체까지 도달하는 과정입니다.
리스너 등록: addEventListener()의 세 번째 인자를 true로 설정하면 캡쳐 리스너로 등록되며(기본값은 false로, 버블 리스너임), 캡쳐 단계에서 먼저 실행됩니다.
흐름 중단: 리스너 내에서 event.stopPropagation()을 호출하면, 해당 이벤T트가 더 이상 전파(캡쳐링 또는 버블링)되는 것을 중단시킵니다.
5. 주요 이벤트 종류
• 마우스 이벤트:
• onclick(클릭), ondblclick(더블클릭), onmousedown(버튼 누름), onmouseup(버튼 뗌) .
onmouseover(요소 위로 올라옴), onmouseout(요소 밖으로 나감), onmousemove(요소 위에서 움직임).
onwheel: 마우스 휠을 굴릴 때 발생. 이벤트 객체의 wheelDelta값이 양수(120)이면 '위로', 음수(-120)이면 '아래로' 굴린 것입니다 .
oncontextmenu: 마우스 오른쪽 버튼 클릭 시 발생. return false;로 '소스 보기' 등의 컨텍스트 메뉴를 금지할 수 있습니다.
로딩 이벤트 (onload):
• window.onload(또는 <body>태그의 onload): 웹 페이지의 모든 리소스(이미지, 스크립트 등) 로딩이 완료되었을 때 window객체에서 발생합니다.
Image.onload: <img>태그의 이미지 로딩이 완료되었을 때 해당 Image 객체에서 발생합니다. 이미지 로딩 완료 전에 width나 height를 읽으면 0이 나올 수 있으므로, 정확한 크기는 onload리스너 안에서 확인해야 합니다.
폼 / 포커스 이벤트:
• onfocusonblur: <input>태그 등이 포커스(키 입력 상태)를 얻거나 잃을 때 발생합니다.
onchange: <select>콤보박스에서 선택된 항목이 변경될 때 발생합니다.
onsubmitonreset: <form>태그에서 submit 또는 reset 버튼이 클릭되었을 때 발생하며, return false;로 폼 전송이나 초기화를 막을 수 있습니다.
키보드 이벤트:
• onkeydown: 모든키가 눌러지는 순간 발생합니다.
onkeypress: 문자 키가 눌러지는 순간 발생합니다.
onkeyup: 눌러진 키가 떼어지는 순간 발생합니다.
이벤트 객체의 key프로퍼티로 'ArrowDown', 'A' 등 눌린 키의 값을 알 수 있습니다.
