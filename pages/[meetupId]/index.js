import { MongoClient, ObjectId } from "mongodb";
import { Fragment } from "react";
import Head from "next/head";

import MeetupDetail from "../../components/meetups/MeetupDetail";

function MeetupDetails(props) {
  return (
    <Fragment>
      <Head>
        <title>{props.meetupData.title}</title>
        <meta name="description" content={props.meetupData.description} />
      </Head>
      <MeetupDetail
        image={props.meetupData.image}
        title={props.meetupData.title}
        address={props.meetupData.address}
        description={props.meetupData.description}
      />
    </Fragment>
  );
}

export async function getStaticPaths() {
  const client = await MongoClient.connect(
    "mongodb+srv://zenvip:Secret123@cluster0.v7xda.mongodb.net/chungpb?retryWrites=true&w=majority"
  );
  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  const meetups = await meetupsCollection.find({}, { _id: 1 }).toArray();
  console.log(meetups);

  client.close();

  return {
    // false những trang không có trong paths tại thời điểm deploy sẽ trả về 404,
    // true kiểm tra lại nếu có sẽ trả về trang trống và đợi dữ liệu, không có sẽ trả về 404
    // blocking kiểm tra lại và  sẽ chỉ hiển thị khi dữ liệu đã được nạp đầy đủ, không có sẽ trả về 404
    fallback: "blocking",
    paths: meetups.map((meetup) => ({
      params: { meetupId: meetup._id.toString() },
    })),
    // paths: [
    //   { params: { meetupId: "608b55c9aba6b61e1e44ffeb" } },
    //   { params: { meetupId: "608b56a6aba6b61e1e44ffec" } },
    // ],
  };
}

export async function getStaticProps(context) {
  // fetch data for a single meetup

  const meetupId = context.params.meetupId;

  const client = await MongoClient.connect(
    "mongodb+srv://zenvip:Secret123@cluster0.v7xda.mongodb.net/chungpb?retryWrites=true&w=majority"
  );
  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  const selectedMeetup = await meetupsCollection.findOne({
    _id: ObjectId(meetupId),
  });

  client.close();

  return {
    props: {
      meetupData: {
        id: selectedMeetup._id.toString(),
        title: selectedMeetup.title,
        address: selectedMeetup.address,
        image: selectedMeetup.image,
        description: selectedMeetup.description,
      },
    },
    revalidate: 1, // nếu dữ liệu thay đổi liên tục thì cập nhật lại mỗi s
  };
}

export default MeetupDetails;
