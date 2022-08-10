	$(document).ready( function() {
		$('*').attr('data-theme', 'd');
		$('#signup_btn').closest('.ui-btn').hide();
		$('#logout_btn').closest('.ui-btn').hide();
		// DB 연결
		openDB();  
		createTable();
		// 이벤트 함수 정의
	 	$('#signup_btn').click( function() {
	 		insertUser();
		});
	 	$('#chk_id').click( function() {
	 		chk_id($('#user_id').val());
		});
		$('#login_btn').click( function() {
	 		login();
		});
		$('#editinfo_btn').click( function() {
	 		change_user_info();
		});
		$('#logout_btn').click( function() {
	 		logout();
		});
		$('#drop_btn').click( function() {
	 		drop_user();
		});
		chk_logined();		// 로그인 되어있을시 적용
		check_user_info();	// 회원정보 조회 및 수정 창에 데이터 로드
	}); 

// 전역변수 선언
var db = null;
var Doc = null;

// 데이터베이스 생성 및 오픈
function openDB(){
	db = window.openDatabase('covidDB', '1.0', '코로나DB', '1024*1024');
	console.log('1_DB 생성 완료');
}

// 테이블 생성 트랜잭션 실행
function createTable() {
	db.transaction(function(tr){
		var createSQL = "create table if not exists COVID19(u_id text, u_pw text, u_name text, u_phone text, u_gender text, is_login int)";
		tr.executeSql(createSQL, [], function(){
			console.log('2_1_테이블생성_sql 실행 성공...');
		}, function(){
			console.log('2_1_테이블생성_sql 실행 실패...');
		});
		}, function(){
			console.log('2_2_테이블 생성 트랜잭션 실패...롤백은 자동');
		}, function(){
			console.log('2_2_테이블 생성 트랜젝션 성공...');
	});
 }
 
 // 데이터 입력(회원가입) 트랜잭션 실행
 function insertUser(){
	db.transaction(function(tr){
		var id = $('#user_id').val();
		var pw = $('#user_password').val();
		var chk_pw = $('#chk_user_password').val();
		var name = $('#user_name').val();
		var phone = $('#user_phone').val();
		var gender = $('#gender').val();

			if(pw != chk_pw){
				alert('비밀번호가 일치하지 않습니다. 다시 시도해주세요.');
			}
			else if(id==""||pw==""||name==""||phone==""){
				alert('누락된 항목이 있습니다. 모든 항목을 입력해 주세요.');
			}
			else{
				var insertSQL = 'insert into COVID19(u_id, u_pw, u_name, u_phone, u_gender, is_login) values(?, ?, ?, ?, ?, 0)';
				tr.executeSql(insertSQL, [id, pw, name, phone, gender], function(tr, rs){
						console.log('3_사용자 등록...no: ' + rs.insertId);
						alert($('#user_id').val() + '님 회원가입 되었습니다.');
						// 초기화
						$('#user_id').val('');
						$('#user_id').removeAttr('disabled');
						$('#user_password').val('');
						$('#chk_user_password').val('');
						$('#user_name').val('');
						$('#user_phone').val('');
						$('#gender').val();

					}, function(tr, err){
						alert('DB오류 ' + err.message + err.code);
					}
				);
			}
	});
 }

// 회원 중복 확인을 위한 데이터 검색 트랜잭션 실행
function chk_id(id){

   db.transaction(function(tr){
	 var selectSQL = 'SELECT u_id from COVID19  WHERE u_id=?';        
  	 tr.executeSql(selectSQL, [id], function(tr, rs){
	  	 	if($('#user_id').val()==""){
	  	 		alert('가입하실 아이디를 입력해주세요.');
	  	 	}
	  	 	else{
		  	 	if(rs.rows.length>0){
					alert('이미 가입된 아이디입니다. 다른 아이디를 사용해주세요.');
		  	 	}
		  	 	else{
		  	 		alert('사용 가능한 아이디입니다.');
		  	 		$('#user_id').attr('disabled', 'disabled');	// 아이디 중복체크 이후 변경 방지
		  	 		$('#signup_btn').closest('.ui-btn').show();
		  	 	}
	  	 	}

	 	});
   });
}

// 로그인을 위한 데이터 검색 트랜잭션 실행
function login(){
	var id = $('#l_user_id').val();
	var pw = $('#password').val();
	if(id==""||pw==""){
		alert('아이디 또는 비밀번호를 입력하지 않았습니다.');
	}
	else {
		db.transaction(function(tr){
		var selectSQL = 'SELECT u_id, u_pw from COVID19  WHERE u_id=?';        
		tr.executeSql(selectSQL, [id], function(tr, rs){
				if(rs.rows.length==0){
					alert('입력하신 아이디가 존재하지 않습니다.');
				}
				else{
					if(rs.rows.item(0).u_pw == pw){
						// 로그인 처리(is_login 컬럼을 1로 변경)
						db.transaction(function(tr){
						var selectSQL = 'UPDATE COVID19 set is_login=1 WHERE u_id=?';        
						tr.executeSql(selectSQL, [id], function(tr, rs){
							//로그인성공시
							chk_logined();		// 로그인창 변경
							check_user_info();	// 회원정보 조회 및 수정 창에 데이터 로드
							//초기화
							$('#l_user_id').val('');
							$('#password').val('');
						});
					});
					}
					else{
						alert('로그인 실패. 비밀번호가 일치하지 않습니다.');
					}
				}
		 	});
	   });

	}
}

// 로그인 완료 시 로그인창 변경
function chk_logined(){
	db.transaction(function(tr){
		var selectSQL = 'SELECT u_name from COVID19 WHERE is_login=1';        
		tr.executeSql(selectSQL, [], function(tr, rs){
			if(rs.rows.length > 0){
				$('#login1').text(rs.rows[0].u_name);
				$('#login1').attr('href','#editinfo');
				$('#logout_btn').closest('.ui-btn').show();
			}
		});
	});
}

// 회원정보 조회
function check_user_info(){
	var gender = null;
	db.transaction(function(tr){
		var selectSQL = 'SELECT u_id, u_name, u_phone, u_gender from COVID19 WHERE is_login=1';
		tr.executeSql(selectSQL, [], function(tr, rs){
			if(rs.rows.length > 0){
				if(rs.rows[0].u_gender == 'male'){
					gender = "남자";
				}
				else {
					gender = "여자";
				}
				$('#info_user_id').val(rs.rows[0].u_id);
				$('#info_user_name').val(rs.rows[0].u_name);
				$('#info_user_phone').val(rs.rows[0].u_phone);
				$('#info_user_gender').val(gender);
				}
		});
	});
}

// 회원정보 변경
function change_user_info(){
	var id = null;
	db.transaction(function(tr){
		var selectSQL = 'SELECT u_id from COVID19 WHERE is_login=1';
		tr.executeSql(selectSQL, [], function(tr, rs){
			id = rs.rows[0].u_id;
		});
	});

	var pw = $('#info_user_password').val();
	var chk_pw = $('#info_chk_user_password').val();
	var name = $('#info_user_name').val();
	var phone = $('#info_user_phone').val();
	if(name==""||phone==""){
		alert("\'이름\' 또는 \'전화번호\'를 비워둘 수 없습니다.");
	}
	else{
		if(pw==""||chk_pw==""){
			alert("회원정보를 수정하려면 비밀번호를 입력해야 합니다. 기존 비밀번호나 변경할 비밀번호를 입력해 주세요.");
		}
		else{
			if(pw==chk_pw){
				db.transaction(function(tr){
					var selectSQL = 'UPDATE COVID19 set u_pw=?, u_name=?, u_phone=? WHERE u_id=?';
					tr.executeSql(selectSQL, [pw, name, phone, id], function(tr, rs){
						$('#login1').text($('#info_user_name').val());
						alert("회원정보가 수정되었습니다.");
					});
				});
			}
			else{
				alert("비밀번호가 일치하지 않습니다.");
			}
		}
	}
}

// 로그아웃 처리
function logout() {
	var id = null;
	db.transaction(function(tr){
		var selectSQL = 'SELECT u_id from COVID19 WHERE is_login=1';
		tr.executeSql(selectSQL, [], function(tr, rs){
			id = rs.rows[0].u_id;
		});
	});
	
		// 로그아웃 처리(is_login 컬럼을 0으로 변경)
		db.transaction(function(tr){
		var selectSQL = 'UPDATE COVID19 set is_login=0 WHERE u_id=?';        
		tr.executeSql(selectSQL, [id], function(tr, rs){
			//로그아웃 성공시
				$('#login1').text("로그인");
				$('#login1').attr('href','#login');
				$('#logout_btn').closest('.ui-btn').hide();	// 로그아웃 버튼 숨기기
			// 초기화
			$('#info_user_id').val('');
			$('#info_user_password').val('');
			$('#info_chk_user_password').val('');
			$('#info_user_name').val('');
			$('#info_user_phone').val('');
			$('#info_user_gender').val('');
		});
	});
}

// 회원탈퇴
function drop_user() {
	var id = null;
	db.transaction(function(tr){
		var selectSQL = 'SELECT u_id from COVID19 WHERE is_login=1';
		tr.executeSql(selectSQL, [], function(tr, rs){
			id = rs.rows[0].u_id;
		});
	});
	var result = confirm("정말로 회원 탈퇴하실건가요?");
	if(result){
		// 예
		db.transaction(function(tr){
			var selectSQL = 'DELETE FROM COVID19 where u_id=?';
			tr.executeSql(selectSQL, [id], function(tr, rs){
				//회원탈퇴 성공시
				$('#login1').text("로그인");
				$('#login1').attr('href','#login');
				$('#logout_btn').closest('.ui-btn').hide();	// 로그아웃 버튼 숨기기
				// 초기화
				$('#info_user_id').val('');
				$('#info_user_password').val('');
				$('#info_chk_user_password').val('');
				$('#info_user_name').val('');
				$('#info_user_phone').val('');
				$('#info_user_gender').val('');
				alert("회원 탈퇴 되었습니다. 지금까지 이용해 주셔서 감사합니다.");
			});
		});
	}
	else{
		alert("탈퇴를 철회해주셔서 감사합니다! :) 앞으로도 많은 이용 부탁드립니다.");
	}
}
