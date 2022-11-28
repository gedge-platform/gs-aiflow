import mysql.connector

def create_tables():
    mycon=mysql.connector.connect(host='localhost',database='aieyeflow',
                                  user='smarteye',password='softonnet',
                                  )

    cursor =mycon.cursor()
    cursor.execute('CREATE DATABASE IF NOT EXISTS aieyeflow CHARACTER SET utf8')
    cursor.execute('USE aieyeflow')
    mycon.commit()

    import codecs
    with codecs.open('./clusterDB.sql','r','utf-8') as f:
        sqlf = f.read()
    cursor.execute(sqlf,multi=True)
def main():
    import argparse

    parser=argparse.ArgumentParser()
    parser.add_argument('--init_db',action='store_true')

    args= parser.parse_args()

    if args.init_db:
        create_tables()
        return 0


if __name__ =="__main__":
    main()