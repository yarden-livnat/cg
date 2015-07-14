__author__ = 'yarden'

from sys import argv
import os
from collections import defaultdict
import csv
import sqlite3 as sql


META_FILENAME = 'meta.csv'
TRANSLATE_FILENAME = 'translate.csv'
KB_FILENAME = 'kb.csv'
ENC_DIR = 'sample'

CG_DB = 'cg.sqlite'

translate = dict()
con = None
root = None

def parse_info(filename):
    return filename[:filename.find('.')]


def parse_file(d, filename):
    enc_id = parse_info(filename)
    enc_tags = []
    with open(d+'/'+filename) as tsv:
        f = csv.reader(tsv, delimiter='\t')
        for line in f:
            name = line[0]
            type = line[1]

            if name == 'highest measured temperature':
                if type[:3] == 'low':
                    name = 'low fever'
                    type = 'present'
                elif type[:4] == 'high fever':
                    name = 'high fever'
                    type = 'present'
                else:
                    name = 'fever'
                    type = 'absent'

            if type == 'present':
                if name in translate:
                    tag_id = translate[name]
                    if tag_id != "":
                        enc_tags.append((enc_id, tag_id))
                else:
                    print name, ': ignored'
    with con:
        con.executemany('insert into enc_tag values (?, ?)', enc_tags)


def parse_all():
    d = root+'/'+ENC_DIR
    for name in os.listdir(d):
        parse_file(d, name)


def load_meta():
    with con:
        with open(root+'/'+META_FILENAME) as meta:
            f = csv.DictReader(meta , delimiter='\t')
            for row in f:
                con.execute('insert into encounter values (?, ?, ?, ?)',
                            (row['MIN(D.DOCUMENT_ID)'], row['ADMIT_DTS'], row['AGE_IN_YEARS'], row['PATIENT_ZIPCODE_CD']))


def init():
    with con:
        # kb
        tags = []
        tags_map = {}
        with open(root+'/'+KB_FILENAME) as kb:
            f = csv.reader(kb)
            f.next()  # skip header
            n = 0
            for row in f:
                item = [row[i] for i in range(5)]
                item.insert(0, n)
                tags.append(item)
                tags_map[item[1]] = n
                n += 1

        con.execute('drop table if exists kb')
        con.execute("""create table kb (
                    id integer primary key,
                    tid text,
                    category text,
                    system text,
                    name text,
                    specific text)""")

        con.executemany('insert into kb (id, tid, category, system, name, specific) values(?, ?, ?, ?, ?, ?)', tags)

        # tagging
        con.execute('drop table if exists enc_tag')
        con.execute('create table enc_tag ('
                    ' enc_id integer,'
                    ' tag_id integer)')

        # encounters
        con.execute('drop table if exists encounter')
        con.execute('create table encounter ('
                    ' id integer primary key,'
                    ' date date,'
                    ' age integer,'
                    ' zipcode text)')

    # translation
    with open(root + '/' + TRANSLATE_FILENAME) as tf:
        f = csv.reader(tf)
        for line in f:
            if line[1] in tags_map:
                translate[line[0]] = tags_map[line[1]]
            else:
                print 'ignored: ', line


# *** Main ***
if len(argv) == 1:
    print 'Usage: ', argv[0], 'dir'
    exit(0)

root = argv[1]
con = sql.connect(root+'/'+CG_DB)
init()
load_meta()
parse_all()