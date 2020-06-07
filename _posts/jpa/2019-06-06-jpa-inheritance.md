---
layout: post
comments: false
title: "#2 JPA 프로그래밍 - 상속 관계"
date: 2020-06-06
image: '/assets/img/'
description: "JPA에서의 상속 관계 매핑 전략"
main-class: dev
tags: jpa java
categories: "JPA"
introduction: "JPA에서의 상속 관계 매핑 전략"
---

# 상속 관계 매핑
## 조인 전략
각각의 테이블로 만들고 조회할 때 조인으로 가져오는 방법  

### 장점
* 테이블이 정규화된다.
* 외래 키 참조 무결성 제약조건을 활용할 수 있다.
* 저장공간을 효율적으로 사용한다.

### 단점
* 조회할 때 조인이 많이 사용되므로 성능이 저하됨.
* 조회 쿼리가 복잡해진다.
* 데이터를 등록할 INSERT SQL이 두 번 실행된다.

### 관련 설정
__@Inheritance(strategy = InheritanceType.JOINDED)__  
상속 매핑은 부모 클래스에 @Inheritance를 사용해야 함. 매핑 전략을 지정할 수 있는데 조인 전략을 사용하므로 JOINED를 지정
