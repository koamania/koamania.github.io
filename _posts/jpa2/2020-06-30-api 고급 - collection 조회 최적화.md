---
layout: post
comments: false
title: "#10 JPA 실무 - API 고급 - Collection 조회 최적화"
date: 2020-06-30
image: '/assets/img/'
description: "API 고급 - Collection 조회 최적화"
main-class: dev
tags: jpa java
categories: "JPA"
introduction: "API 고급 - Collection 조회 최적화"
---
# Collection 조회 성능 최적화하는 단계적 방법
## xToMany
### Entity 노출에 대한 문제
- Entity를 외부에 노출하지 말라는건 모든 Entity를 DTO로 변환해서 내려줘야 한다는 뜻
```java
public class DTO {
  // OrderItem Entity
  // 잘못된 부분
  private List<OrderItem> orderItems;
}
```
### DTO로 변환
- 모든 Object는 DTO로 변환해서 내려줘야 함
- 하지만 마찬가지로 N+1 문제때문에 성능이 안좋음

### Fetch join
- 쿼리가 N번 도는 문제를 해결할 수 있음
- Cartesian Product의 문제가 발생할 수 있으므로 distinct 등으로 해결해줘야 함


#### distinct
- 중복 제거(쿼리로 변환되었을 때 distinct 키워드 하나 붙여준다)
- @Id를 기준으로 엔티티를 중복 제거해준다
- db의 distinct 키워드는 row가 완벽하게 동일하지 않아서 의미가 없을 수 있음
- jqpl의 distinct는 중복 엔티티가 제거되기때문에 

#### 단점
- **페이징이 불가능**

> - collection fetch join을 사용하면 페이징이 불가능하다.
>    - hibernate는 경고 로그를 남기고 모든 데이터를 DB에서 읽어온 후 메모리에서 페이징 해버린다.
> - collection fetch join은 1개만 사용할 수 있음. 둘 이상의 fetch join을 사용할 경우 데이터가 부정합하게 조회될 수 있다.