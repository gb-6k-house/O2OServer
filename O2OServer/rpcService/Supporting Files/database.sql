/*
 创建数据库 CREATE DATABASE `mysqlsample1` CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
*/

/*
  匿名信息表
*/
create table if not EXISTS t_anonymous(type INT not NULL,
name VARCHAR(255) not null);

/*
insert INTO t_anonymous(type,name) VALUES(1, '唐僧');
insert INTO t_anonymous(type,name) VALUES(1, '孙悟空');
insert INTO t_anonymous(type,name) VALUES(1, '猪八戒');
insert INTO t_anonymous(type,name) VALUES(1, '沙和尚');
insert INTO t_anonymous(type,name) VALUES(1, '如来佛');
insert INTO t_anonymous(type,name) VALUES(1, '观世音');
insert INTO t_anonymous(type,name) VALUES(1, '玉皇大帝');
*/
/*
用户登录信息表
*/
create table if not EXISTS t_user(longitude double not NULL,
latitude double not null,
IMEI VARCHAR(255) not null,
loginDate VARCHAR(80) not null
);

/*
用户消息列表
*/

create table if not EXISTS t_localation_msg(
	IMEI VARCHAR(255) not null,
        msg VARCHAR(255) ,
       date VARCHAR(80) not null, 
       longitude double not NULL,
       latitude double not null
);

/*
创建计算距离的函数
*/

drop function GetDistance;
delimiter $$ 
CREATE  FUNCTION GetDistance(lat1 DOUBLE,lng1 DOUBLE,lat2 DOUBLE,lng2 DOUBLE) 
RETURNS DOUBLE 
  /*earth_padius double := 6378.137;地球半径*/
BEGIN

 return  round(6378.137*2*asin(sqrt(pow(sin(
(lat1*pi()/180-lat2*pi()/180)/2),2)+cos(lat1*pi()/180)*cos(lat2*pi()/180)*
pow(sin( (lng1*pi()/180-lng2*pi()/180)/2),2)))*1000);
END$$

delimiter;

/*
*用户表增加登录平台，android, ios ,web 不区分大小写
*/
alter table t_user add platform varchar(88) default 'android';

commit;

