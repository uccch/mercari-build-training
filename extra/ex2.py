import pprint
from matplotlib import pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn import datasets

wine_data = datasets.load_wine()

wine_df = pd.DataFrame(data=wine_data.data, columns=wine_data.feature_names)

wine_df['target'] = wine_data.target

sns.scatterplot(data=wine_df, x='color_intensity', y='proline', hue='target')

plt.title('Color Intensity vs proline')

plt.show()
