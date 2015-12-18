from pyspark.mllib.recommendation import ALS, MatrixFactorizationModel, Rating
from pyspark import SparkContext

def Recommendation(filename, foods):
	print ('successful')
	sc = SparkContext('local', 'Simple App')

	ratings = sc.textFile(filename)
	processedRatings = ratings.map(lambda line: (int(line.split(",")[0]),int(line.split(",")[1]),float(line.split(",")[2])))
	users = ratings.map(lambda rating: int(rating.split(",")[0])).distinct().collect()

    #train model
	model = ALS.trainImplicit(processedRatings, 1,seed=10)

	rdict = {}
	recommenddict = {}
	for user in users:
		recommenddict.setdefault(user,[])
    
	for user in users: 
		rdict[user]= model.recommendProducts(user,5)
		for Rating in rdict[user]:
			recommenddict[user].append(foods[Rating.product])
		#recommenddict[user].append(Rating[1])       
	print (recommenddict)
	sc.stop()
	return recommenddict

