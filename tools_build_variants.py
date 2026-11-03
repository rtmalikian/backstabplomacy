#!/usr/bin/env python3
"""Build variants/caucasus.json + variants/empires.json.
Same data model as variants/classic.json. lat/lon are real places."""
import json, pathlib

def build(rows, starts, win, name, note):
    borders={r[0]:set(r[7]) for r in rows}
    for a,bs in list(borders.items()):
        for b in list(bs): borders[b].add(a)
    terr=[]
    for pid,nm,typ,sc,home,lat,lon,_ in rows:
        terr.append({"id":pid,"name":nm,"type":typ,"supplyCenter":bool(sc),"home":home or None,"lat":lat,"lon":lon,"borders":sorted(borders[pid])})
    out={"variant":name,"source":"Original map data created for Backstabber Reborn for Raphael's Armenian church play group. "+note,"territories":terr,"startingUnits":starts,"winSupplyCenters":win}
    n_sc=sum(t["supplyCenter"] for t in terr)
    print(name, len(terr),"territories,",n_sc,"SCs, win",win)
    assert all(b in borders for t in terr for b in t["borders"])
    return out

# ---------------- CAUCASUS & CASPIAN ----------------
# id, name, type, sc, home, lat, lon, borders
C=[
("BLK","Black Sea","sea",0,"",43.4,34.0,["CRI","NOV","SOC","TRA","BAT","AEG"]),
("AEG","Aegean Sea","sea",0,"",39.0,25.3,["ATH","THE","CRE","CON","BLK","MED"]),
("MED","Eastern Mediterranean","sea",0,"",34.8,27.0,["AEG","CRE","CYP","ALE","CON"]),
("CSP","Caspian Sea","sea",0,"",42.6,50.8,["DER","MAK","BAK","LAN","GIL"]),
("SEV","Lake Sevan","land",0,"",40.3,45.0,["YER","LOR","ART","KAK"]),
("YER","Yerevan","land",1,"Armenia",40.18,44.51,["GYU","LOR","SEV","NAK","ARD","KAR"]),
("GYU","Gyumri (Alexandropol)","land",1,"Armenia",40.79,43.85,["YER","LOR","KAR","BAT"]),
("LOR","Lori (Vanadzor)","land",0,"",41.0,44.5,["GYU","YER","SEV","TBI","KAK"]),
("SYU","Syunik (Kapan)","land",0,"",39.3,46.4,["ART","NAK","ARD","GAN"]),
("ART","Artsakh (Stepanakert)","land",1,"Armenia",39.82,46.75,["SEV","SYU","KAK","GAN","SHI"]),
("NAK","Nakhichevan","land",0,"",39.2,45.4,["YER","SYU","ARD","TAB"]),
("KAR","Kars","coast",1,"",40.6,43.08,["GYU","YER","ARD","ERZ","BAT"]),
("TBI","Tbilisi","land",1,"Georgia",41.72,44.78,["LOR","KAK","KUT","OSS"]),
("KAK","Kakheti","land",0,"",41.9,45.6,["TBI","LOR","SEV","ART","GAN","DER"]),
("KUT","Kutaisi","land",1,"Georgia",42.25,42.68,["TBI","BAT","ABK","OSS"]),
("BAT","Batumi","coast",1,"Georgia",41.65,41.63,["KUT","ABK","GYU","KAR","TRA","BLK"]),
("ABK","Abkhazia (Sukhumi)","coast",0,"",43.0,41.02,["KUT","BAT","SOC","OSS","BLK"]),
("BAK","Baku","coast",1,"Azerbaijan",40.41,49.87,["SHI","DER","CSP"]),
("GAN","Ganja","land",1,"Azerbaijan",40.68,46.36,["KAK","ART","SYU","SHI","TAB"]),
("SHI","Shirvan (Shamakhi)","coast",1,"Azerbaijan",40.9,48.6,["BAK","GAN","DER","ART","CSP"]),
("LAN","Lankaran","coast",0,"",38.75,48.85,["ARD","TAB","GIL","CSP"]),
("DER","Derbent","coast",1,"",42.06,48.29,["KAK","SHI","BAK","MAK","CHE","CSP"]),
("KRA","Krasnodar (Kuban)","land",1,"Russia",45.03,38.97,["NOV","CRI","OSS","CHE"]),
("NOV","Novorossiysk","coast",0,"",44.72,37.77,["KRA","CRI","SOC","BLK"]),
("SOC","Sochi","coast",0,"",43.58,39.72,["NOV","ABK","OSS","BLK"]),
("CRI","Crimea (Sevastopol)","coast",1,"Russia",44.95,34.1,["KRA","NOV","BLK"]),
("OSS","North Ossetia (Vladikavkaz)","land",0,"",43.02,44.68,["TBI","KUT","ABK","SOC","KRA","CHE"]),
("CHE","Chechnya (Grozny)","land",0,"",43.32,45.69,["OSS","KRA","DER","MAK"]),
("MAK","Makhachkala","coast",1,"Russia",42.98,47.5,["CHE","DER","CSP"]),
("CON","Constantinople","coast",1,"Turkey",41.0,28.97,["THE","AEG","MED","BLK","TRA"]),
("TRA","Trabzon","coast",1,"Turkey",41.0,39.72,["CON","BLK","BAT","KAR","ERZ"]),
("ERZ","Erzurum","land",0,"",39.9,41.27,["TRA","KAR","VAN"]),
("VAN","Van","land",1,"Turkey",38.5,43.4,["ERZ","KAR","ARD","TAB","ALE"]),
("ALE","Aleppo","land",0,"",36.2,37.13,["VAN","CON","MED"]),
("TAB","Tabriz","land",1,"Persia",38.08,46.29,["NAK","GAN","VAN","ARD","LAN","TEH"]),
("ARD","Ardabil","land",0,"",38.25,48.3,["TAB","NAK","YER","KAR","VAN","LAN","GIL"]),
("TEH","Tehran","land",1,"Persia",35.69,51.39,["TAB","GIL"]),
("GIL","Gilan (Rasht)","coast",1,"Persia",37.28,49.58,["ARD","LAN","TEH","CSP"]),
("ATH","Athens","coast",1,"Greece",37.98,23.73,["THE","AEG","CRE"]),
("THE","Thessaloniki","coast",1,"Greece",40.64,22.94,["ATH","CON","AEG"]),
("CRE","Crete","coast",1,"Greece",35.2,24.9,["ATH","AEG","MED","CYP"]),
("CYP","Cyprus","coast",1,"",35.05,33.0,["CRE","MED","ALE","CON"]),
]
caucasus_starts={
 "Armenia":[{"unit":"A","prov":"YER"},{"unit":"A","prov":"ART"},{"unit":"A","prov":"GYU"}],
 "Georgia":[{"unit":"A","prov":"TBI"},{"unit":"A","prov":"KUT"},{"unit":"F","prov":"BAT"}],
 "Azerbaijan":[{"unit":"F","prov":"BAK"},{"unit":"A","prov":"GAN"},{"unit":"A","prov":"SHI"}],
 "Russia":[{"unit":"A","prov":"KRA"},{"unit":"F","prov":"CRI"},{"unit":"F","prov":"MAK"}],
 "Turkey":[{"unit":"A","prov":"CON"},{"unit":"F","prov":"TRA"},{"unit":"A","prov":"VAN"}],
 "Persia":[{"unit":"A","prov":"TAB"},{"unit":"A","prov":"TEH"},{"unit":"F","prov":"GIL"}],
 "Greece":[{"unit":"A","prov":"ATH"},{"unit":"F","prov":"THE"},{"unit":"F","prov":"CRE"}],
}
caucasus=build(C,caucasus_starts,11,"Caucasus & Caspian — Armenia, Georgia, Azerbaijan, Persia, Russia, Turkey, Greece",
 "The Caucasus is one of the great under-represented boards in strategy gaming: seven peoples between two seas, one mountain spine, and everybody's empire has marched through it. Centres: Yerevan, Artsakh and Gyumri for Armenia; Tbilisi, Kutaisi and Batumi for Georgia; Baku, Ganja and Shirvan for Azerbaijan; Constantinople, Trabzon and Van for Turkey (yes, someone has to play Turkey — draw lots, loser gets the Bosphorus); Tabriz, Tehran and Gilan for Persia; Krasnodar, Crimea and Makhachkala for Russia; Athens, Thessaloniki and Crete for Greece. Kars, Derbent and Cyprus start neutral.")

# ---------------- EMPIRES OF THE CROSSROADS (historic what-if) ----------------
E=[
("MED","Mediterranean Sea","sea",0,"",35.5,19.0,["SIC","ROM","CRE","CYP","ALX","ATH"]),
("AEG","Aegean Sea","sea",0,"",38.8,25.5,["ATH","THE","EPH","CON","CRE","MED"]),
("BLK","Black Sea","sea",0,"",43.4,34.5,["CON","PHA","TRA","EPH"]),
("CSP","Caspian Sea","sea",0,"",42.8,50.5,["DER","SHA","ECB"]),
("ROM","Rome","coast",1,"Rome",41.9,12.5,["RAV","SIC","MED"]),
("RAV","Ravenna","coast",1,"Rome",44.42,12.2,["ROM","SIC","ATH"]),
("SIC","Sicily","coast",1,"Rome",37.6,14.2,["ROM","RAV","MED","CRE"]),
("ATH","Athens","coast",1,"Byzantine Empire",37.98,23.73,["THE","RAV","AEG","MED","CRE"]),
("THE","Thessalonica","coast",1,"Byzantine Empire",40.64,22.94,["ATH","CON","AEG"]),
("CON","Constantinople","coast",1,"Byzantine Empire",41.0,28.97,["THE","EPH","ANT","AEG","BLK","TRA"]),
("EPH","Ephesus (Anatolia)","coast",0,"",37.94,27.34,["CON","CAP","AEG","BLK"]),
("CAP","Cappadocia","land",0,"",38.7,35.5,["EPH","CIL","ANI","ANT"]),
("CIL","Cilicia","coast",0,"",36.9,35.3,["CAP","ANT","SYR","CYP"]),
("ANT","Antioch","coast",1,"Byzantine Empire",36.16,36.16,["CON","CAP","CIL","SYR","DAM"]),
("SYR","Syria","land",0,"",35.0,38.5,["CIL","ANT","DAM","TIG","PAL"]),
("DAM","Damascus","land",1,"",33.5,36.3,["ANT","SYR","JER","PET"]),
("JER","Jerusalem — the Holy City","land",1,"",31.78,35.22,["DAM","PET","ALX","MED"]),
("PET","Petra","land",0,"",30.33,35.44,["JER","DAM","PAL","CAI"]),
("PAL","Palmyra","land",0,"",34.55,38.27,["SYR","PET","CTE"]),
("ALX","Alexandria","coast",1,"Egypt",31.2,29.9,["CAI","JER","MED","CYP"]),
("CAI","Memphis (Cairo)","land",1,"Egypt",30.0,31.25,["ALX","PET","LUX"]),
("LUX","Thebes (Luxor)","land",1,"Egypt",25.69,32.64,["CAI"]),
("CYP","Cyprus","coast",1,"",35.05,33.0,["CIL","ALX","MED","AEG"]),
("CRE","Crete","coast",1,"",35.2,24.9,["ATH","SIC","MED","AEG"]),
("TRA","Trebizond","coast",0,"",41.0,39.72,["CON","BLK","PHA","ANI"]),
("ANI","Ani — City of 1001 Churches","land",1,"Kingdom of Armenia",40.5,43.57,["TRA","CAP","ARTX","VAN","KUT"]),
("ARTX","Artaxata (Armenian capital)","land",1,"Kingdom of Armenia",39.95,44.57,["ANI","VAN","QAB","MTS"]),
("VAN","Van (Lake Van)","land",1,"Kingdom of Armenia",38.5,43.4,["ANI","ARTX","TIG","ECB"]),
("TIG","Tigranocerta","land",0,"",38.14,41.0,["VAN","SYR","CTE"]),
("CTE","Ctesiphon (Mesopotamia)","land",1,"Sasanian Persia",33.1,44.58,["TIG","PAL","PER","ECB"]),
("PER","Persepolis","land",1,"Sasanian Persia",29.94,52.89,["CTE"]),
("ECB","Ecbatana (Hamadan)","land",1,"Sasanian Persia",34.8,48.5,["CTE","VAN","QAB","CSP"]),
("MTS","Mtskheta (Iberian capital)","land",1,"Kingdom of Iberia",41.84,44.71,["ARTX","KUT","QAB","PHA"]),
("KUT","Kutaisi (Colchis)","land",1,"Kingdom of Iberia",42.25,42.68,["MTS","ANI","PHA"]),
("PHA","Phasis","coast",1,"Kingdom of Iberia",42.15,41.67,["KUT","MTS","TRA","BLK"]),
("QAB","Qabala (Albanian capital)","land",1,"Caucasian Albania",40.98,47.85,["MTS","ARTX","ECB","SHA","DER"]),
("SHA","Shabaran","coast",1,"Caucasian Albania",41.2,48.9,["QAB","DER","CSP"]),
("DER","Derbent — the Caspian Gates","coast",1,"Caucasian Albania",42.06,48.29,["SHA","QAB","CSP"]),
]
empire_starts={
 "Rome":[{"unit":"A","prov":"ROM"},{"unit":"F","prov":"RAV"},{"unit":"A","prov":"SIC"}],
 "Byzantine Empire":[{"unit":"A","prov":"CON"},{"unit":"F","prov":"ATH"},{"unit":"A","prov":"ANT"}],
 "Kingdom of Armenia":[{"unit":"A","prov":"ARTX"},{"unit":"A","prov":"ANI"},{"unit":"A","prov":"VAN"}],
 "Sasanian Persia":[{"unit":"A","prov":"CTE"},{"unit":"A","prov":"PER"},{"unit":"A","prov":"ECB"}],
 "Kingdom of Iberia":[{"unit":"A","prov":"MTS"},{"unit":"F","prov":"PHA"},{"unit":"A","prov":"KUT"}],
 "Caucasian Albania":[{"unit":"A","prov":"QAB"},{"unit":"F","prov":"DER"},{"unit":"A","prov":"SHA"}],
 "Egypt":[{"unit":"F","prov":"ALX"},{"unit":"A","prov":"CAI"},{"unit":"A","prov":"LUX"}],
}
empires=build(E,empire_starts,12,"Empires of the Crossroads — Rome, Byzantium, Armenia, Persia, Iberia, Albania, Egypt (historic what-if)",
 "A church-group sandbox: empires from different centuries meet on one board — it is a what-if, not a history exam. Armenia was the first nation to adopt Christianity (301 AD, under Tiridates III, evangelised by St Gregory the Illuminator); Ani was famed as the City of 1001 Churches; Jerusalem starts neutral and is worth exactly one centre like everywhere else — but watch what your friends will pay for it. Caucasian Albania (no relation to Balkan Albania) and Iberia (no relation to Spain) are the forgotten Christian kingdoms of the Caucasus, restored here to playable glory.")

root=pathlib.Path(__file__).parent
(root/"variants"/"caucasus.json").write_text(json.dumps(caucasus,indent=1))
(root/"variants"/"empires.json").write_text(json.dumps(empires,indent=1))
print("written")
