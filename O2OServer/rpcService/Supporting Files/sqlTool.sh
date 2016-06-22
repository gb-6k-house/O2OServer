#!/bin/sh
#created by niupark on 16/1/13.

#读取文件中匿名信息,生成执行数据库插入的SQL
#包含参数 1 源文件, 2 生成的SQL文件名 3- 匿名的type字段类型
function insertAnonymous(){
    inFile=$1
    touch $2
    cat $inFile|while read line
    do
    if [ -z $line ]
    then
    echo "empty line"
    else
    sql="insert INTO t_anonymous(type,name) VALUES($3, '$line');";
    echo $sql
    echo $sql >> $2
    fi
    done
}
insertAnonymous $1 $2 $3
