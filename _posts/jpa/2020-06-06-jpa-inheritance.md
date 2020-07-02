---
layout: post
comments: false
title: "#2 JPA 프로그래밍 - 상속 관계"
date: 2020-06-06
image: '/assets/img/'
description: "JPA에서의 상속 관계 매핑 전략"
main-class: dev
tags: jpa java
category: "JPA"
introduction: "JPA에서의 상속 관계 매핑 전략"
---

# 상속 관계 매핑
## 조인 전략
각각의 테이블로 만들고 조회할 때 조인으로 가져오는 방법  

### 특징
* 테이블이 정규화된다.
* 외래 키 참조 무결성 제약조건을 활용할 수 있다.
* 저장공간을 효율적으로 사용한다.
* 조회할 때 조인이 많이 사용되므로 성능이 저하됨.
* 조회 쿼리가 복잡해진다.
* 데이터를 등록할 INSERT SQL이 두 번 실행된다.

### 관련 설정
***@Inheritance(strategy = InheritanceType.JOINDED)***  
상속 매핑은 부모 클래스에 @Inheritance를 사용해야 함. 매핑 전략을 지정할 수 있는데 조인 전략을 사용하므로 JOINED를 지정

***@DiscriminatorColumn***  
서브 타입을 구분하기 위한 어노테이션. 컬럼명을 지정할 수 있고 기본값은 DTYPE이다.

## 단일 테이블 전략
서비스 규모가 크지 않고, 굳이 조인 전략을 선택해서 복잡하게 갈 필요가 없다고 판단 될 때에는 한 테이블에 다 저장하고 DTYPE으로 구분하는 전략

### 특징
* INSERT 쿼리도 한 번, SELECT 쿼리도 한 번이다. 조인할 필요가 없어 성능이 좋다.
* 한 테이블에 모든 컬럼을 저장하기 떄문에 DTYPE 없이는 구분 할 수 없다.
* 비정규화된 전략
* 서브 타입이 모드 한 테이블에 저장되므로 모든 서브타입의 필드는 nullable이여야 한다.
* 상황에 따라서는 데이터 조회시 조인 전략보다 느릴 수 있다.

### 관련 설정
***@Inheritance(strategy = InheritanceType.SINGLE_TABLE)***  
단일 테이블 전략을 사용할 시의 전략. Inheritance의 strategy 기본값이 SINGLE_TABLE이기때문에 별도로 strategy를 지정하지 않아도 된다.

***@DiscriminatorColumn***  
선언하지 않아도 자동으로 DTYPE의 컬럼이 생성된다. 단일 테이블에 모든 데이터를 저장하므로 DTYPE이 없이는 테이블을 판단 할 수 없다.

## 구현 클래스마다 테이블을 생성하는 전략
조인 전략과 유사하지만, 슈퍼 타입의 컬럼들을 서브 타입으로 내린다.

### 특징
* 슈퍼 타입의 테이블을 생성하지 않는다.
* 슈퍼 타입의 선언된 컬럼들을 중복으로 각 테이블에 선언한다.(어찌보면 당연)
* DB의 논리적인 모델에서는 서로간의 연관관계가 없다.
* 되도록이면 피해야하는 설계

### 관련 설정
***@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)***  
서브타입 테이블을 각각 생성하는 전략을 사용하기 위한 어노테이션

***@GeneratedValue(strategy = GenerationType.AUTO)***  
__@Id__의 GenerationType이 IDENTITY일 경우 문제가 발생할 수 있음.
GenerationType.AUTO로 지정하거나 GenerationType.TABLE로 지정해야하고 [TABLE인 경우에 시퀀스와의 별도 매핑을 해줘야 완벽히 해결된다.](https://stackoverflow.com/questions/916169/cannot-use-identity-column-key-generation-with-union-subclass-table-per-clas)
