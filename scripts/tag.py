__author__ = 'yarden'

from sys import argv
import os
from collections import defaultdict
import csv
import sqlite3 as sql


META_FILENAME = 'meta.csv'
TRANSLATE_FILENAME = 'translate.csv'
KB_FILENAME = 'kb.csv'
ENC_DIR = 'encounters'

CG_DB = 'cg.sqlite'

conn = None
root = None
tags_map = {}

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
                if name in tags_map:
                    tag_id = tags_map[name]
                    if tag_id != "":
                        enc_tags.append((enc_id, tag_id))
                # else:
                #     print name, ': ignored'
    with conn:
        conn.executemany('insert into enc_tag values (?, ?)', enc_tags)


def parse_all():
    d = root+'/'+ENC_DIR
    for name in os.listdir(d):
        parse_file(d, name)


def load_meta():
    pathogens = None
    enc_pat = []
    with conn:
        with open(root+'/'+META_FILENAME) as meta:
            f = csv.reader(meta, delimiter='\t')
            header = f.next()
            pathogens = header[5:-1]
            id_idx = header.index('MIN(D.DOCUMENT_ID)')
            date_idx = header.index('ADMIT_DTS')
            age_idx = header.index('AGE_IN_YEARS')
            zipcode_idx = header.index('PATIENT_ZIPCODE_CD')
            for row in f:
                conn.execute('insert into encounter values (?, ?, ?, ?)',
                            (row[id_idx], row[date_idx][:10], row[age_idx], row[zipcode_idx]))

                for i, p in enumerate(row[5:-1], 1000):
                    if p == '0':
                        enc_pat.append((row[id_idx], i, False))
                    elif p == '1':
                        enc_pat.append((row[id_idx], i, True))

    conn.executemany('insert into pathogen_info values (?, ?)', enumerate(pathogens, 1000))
    conn.executemany('insert into pathogens values (?, ?, ?)', enc_pat)


def load_detectors():
    conn.execute('insert into detector_info values (?, ?)', (1, 'Influenza'))

    with conn:
        detectors = []
        with open(root + '/influenza.csv') as d:
            f = csv.DictReader(d)
            for row in f:
                detectors.append((1, row['encounter'], row['posterior_prob_influenza'], row['posterior_prob_nili']))
        conn.executemany('insert into detectors values (?, ?, ?, ?)', detectors)


def init():
    with conn:
        # kb
        tags = []
        with open(root+'/'+KB_FILENAME) as kb:
            f = csv.reader(kb)
            f.next()  # skip header
            n = 0
            for row in f:
                if row[0] == '' and row[1] != "":
                    item = [n]
                    item.extend(row[4:])
                    tags.append(item)
                    tags_map[row[1]] = n
                    n += 1

        conn.execute('drop table if exists kb')
        conn.execute("""
            create table kb (
                id integer primary key,
                category text,
                name text,
                flavor text,
                system text
            )
           """)

        conn.executemany('insert into kb (id, category, name, flavor, system) values(?, ?, ?, ?, ?)', tags)

        # pathogens
        conn.execute('drop table if exists pathogen_info')
        conn.execute("""
            create table pathogen_info (
                id integer primary key,
                name text,
                label text
            )
            """)

        conn.execute('drop table if exists pathogens')
        conn.execute("""
            create table pathogens (
                enc_id integer,
                path_id integer,
                positive boolean
            )
            """)

        # detectors
        conn.execute('drop table if exists detector_info')
        conn.execute("""
            create table detector_info (
                id integer primary key,
                name text
            )
            """)

        conn.execute('drop table if exists detectors')
        conn.execute("""
            create table detectors (
                did integer,
                eid integer,
                prob real,
                similar real
            )
            """)

        # tagging
        conn.execute('drop table if exists enc_tag')
        conn.execute("""
            create table enc_tag (
                enc_id integer,
                tag_id integer
                )
            """)

        # encounters
        conn.execute('drop table if exists encounter')
        conn.execute("""
            create table encounter (
                id integer primary key,
                date date,
                age integer,
                zipcode text
            )
            """)

# *** Main ***
if len(argv) == 1:
    print 'Usage: ', argv[0], 'dir'
    exit(0)

root = argv[1]
conn = sql.connect(root+'/'+CG_DB)
init()
load_meta()
load_detectors()
parse_all()